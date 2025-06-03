import { ISession, StudySession } from "../models/session.model";
import mongoose from "mongoose";
import { Study } from "../models/study.model";
import { Comparison } from "../models/comparison.model";

export const createSession = async (
  studyId: string | mongoose.Types.ObjectId
) => {
  const study = await Study.findById(studyId);
  if (!study) {
    throw new Error("Study not found");
  }

  const session = await StudySession.create({
    study: studyId,
    currentQuestionIndex: 0,
  });

    await Study.findByIdAndUpdate(studyId, {
    $inc: { participantCount: 1 },
  });

  return session._id;
};

export const completeSession = async (
  sessionId: string | mongoose.Types.ObjectId,
  demographicsData: ISession["demographics"]
): Promise<ISession> => {
  const session = await StudySession.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  session.demographics = demographicsData;
  session.isComplete = true;
  session.endTime = new Date();

  return await session.save();
};

export const getSessionById = async (sessionId: string) => {
  const session = await StudySession.findById(sessionId)
    .populate("study")
    .populate("responses.comparison");

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
};

export const addResponse = async (
  sessionId: string | mongoose.Types.ObjectId,
  comparisonId: string | mongoose.Types.ObjectId,
  responseData: any
) => {
  const session = await StudySession.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const comparison = await Comparison.findById(comparisonId);
  if (!comparison) throw new Error("Comparison not found");

  const study = await Study.findById(session?.study?._id);
  if (!study) throw new Error("Study not found");

  const baseResponse = {
    comparison: comparison._id as mongoose.Types.ObjectId, // Convert string to ObjectId
    comparisonTitle: comparison.title,
  };

  switch (comparison.type) {
    case "rating":
      if (!Array.isArray(responseData)) {
        throw new Error("Rating response data must be an array");
      }
      const ratingResponse = session.responses.push({
        ...baseResponse,
        ratingResponses: responseData.map((item) => ({
          stimulus: item.stimulusId,
          rating: item.rating,
        })),
      });
      break;

    case "binary":
      if (!Array.isArray(responseData)) {
        throw new Error("Binary response data must be an array");
      }
      const binaryResponse = session.responses.push({
        ...baseResponse,
        binaryResponses: responseData.map((item) => ({
          stimulus: item.stimulusId,
          selected: item.selected,
        })),
      });
      break;

    case "multi-select":
      if (!Array.isArray(responseData)) {
        throw new Error("Multi-select response data must be an array");
      }
      const multiSelectResponse = session.responses.push({
        ...baseResponse,
        multiSelectResponses: responseData.map((item) => item.stimulusId),
      });
      break;

    case "single-select":
      const singleSelectResponse = session.responses.push({
        ...baseResponse,
        singleSelectResponses: responseData.stimulusId,
      });
      break;
    default:
      throw new Error("Invalid comparison type");
  }

  // Increment the currentQuestionIndex if there are more comparisons
  if (
    study.comparisons &&
    session.currentComparisonIndex < study.comparisons.length - 1
  ) {
    session.currentComparisonIndex += 1;
  }

  return await session.save();
};

/**
 * Get statistics for sessions associated with a specific study
 * @param studyId - The ID of the study to get session statistics for
 */
export const getSessionStatsByStudyId = async (
  studyId: string | mongoose.Types.ObjectId
) => {
  // Check if study exists
  const study = await Study.findById(studyId).populate("comparisons");
  if (!study) {
    throw new Error("Study not found");
  }

  // Fetch all completed sessions for diagnostics
  const diagCompletedSessions = await StudySession.find({
    study: studyId,
    isComplete: true,
  });

  // Log detailed demographic data for debugging
  console.log(
    `Found ${
      diagCompletedSessions.length
    } completed sessions for study ${studyId.toString()}`
  );
  diagCompletedSessions.forEach((session) => {
    console.log(
      `Session ${session._id} complete: ${session.isComplete}, demographics:`,
      JSON.stringify({
        gender: session.demographics?.gender || "MISSING",
        age: session.demographics?.age || "MISSING",
        educationLevel: session.demographics?.educationLevel || "MISSING",
      })
    );
  });

  // Get basic statistics using MongoDB aggregation
  const sessionStats = await StudySession.aggregate([
    {
      $match: { study: new mongoose.Types.ObjectId(studyId) },
    },
    {
      $facet: {
        totalSessions: [{ $count: "count" }],
        completedSessions: [
          { $match: { isComplete: true } },
          { $count: "count" },
        ],
        // Aggregate demographic data for completed sessions
        demographicData: [
          { $match: { isComplete: true } },
          {
            $group: {
              _id: null,
              genders: {
                $push: { $ifNull: ["$demographics.gender", "Not Specified"] },
              },
              ageGroups: {
                $push: { $ifNull: ["$demographics.age", "Not Specified"] },
              },
              educationLevels: {
                $push: {
                  $ifNull: ["$demographics.educationLevel", "Not Specified"],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  // Extract session statistics
  const stats = sessionStats[0];
  const totalSessions = stats.totalSessions[0]?.count || 0;
  const completedSessions = stats.completedSessions[0]?.count || 0;
  const incompleteSessions = totalSessions - completedSessions;

  // Process demographic data using MongoDB aggregation
  const demographicData = await StudySession.aggregate([
    {
      $match: {
        study: new mongoose.Types.ObjectId(studyId),
        isComplete: true,
      },
    },
    {
      $facet: {
        // Gender distribution
        genderDistribution: [
          {
            $group: {
              _id: {
                $cond: {
                  if: { $eq: [{ $type: "$demographics.gender" }, "missing"] },
                  then: "Not Specified",
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$demographics.gender", null] },
                          { $eq: ["$demographics.gender", ""] },
                          { $eq: ["$demographics.gender", "undefined"] },
                          { $eq: ["$demographics.gender", "null"] },
                        ],
                      },
                      then: "Not Specified",
                      else: "$demographics.gender",
                    },
                  },
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              gender: "$_id",
              count: 1,
            },
          },
        ],

        // Age group distribution
        ageGroupDistribution: [
          {
            $group: {
              _id: {
                $cond: {
                  if: { $eq: [{ $type: "$demographics.age" }, "missing"] },
                  then: "Not Specified",
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$demographics.age", null] },
                          { $eq: ["$demographics.age", ""] },
                          { $eq: ["$demographics.age", "undefined"] },
                          { $eq: ["$demographics.age", "null"] },
                        ],
                      },
                      then: "Not Specified",
                      else: "$demographics.age",
                    },
                  },
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              ageGroup: "$_id",
              count: 1,
            },
          },
        ],

        // Education level distribution
        educationLevelDistribution: [
          {
            $group: {
              _id: {
                $cond: {
                  if: {
                    $eq: [{ $type: "$demographics.educationLevel" }, "missing"],
                  },
                  then: "Not Specified",
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$demographics.educationLevel", null] },
                          { $eq: ["$demographics.educationLevel", ""] },
                          {
                            $eq: ["$demographics.educationLevel", "undefined"],
                          },
                          { $eq: ["$demographics.educationLevel", "null"] },
                        ],
                      },
                      then: "Not Specified",
                      else: "$demographics.educationLevel",
                    },
                  },
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              educationLevel: "$_id",
              count: 1,
            },
          },
        ],
      },
    },
  ]);

  // Convert array results to objects for easier consumption
  const genderData = demographicData[0].genderDistribution.reduce(
    (acc: any, curr: any) => {
      // Normalize demographic key
      const key =
        curr.gender === undefined ||
        curr.gender === null ||
        curr.gender === "undefined" ||
        curr.gender === "null" ||
        curr.gender === ""
          ? "Not Specified"
          : curr.gender;
      acc[key] = curr.count;
      return acc;
    },
    {}
  );

  const ageGroupData = demographicData[0].ageGroupDistribution.reduce(
    (acc: any, curr: any) => {
      // Normalize demographic key
      const key =
        curr.ageGroup === undefined ||
        curr.ageGroup === null ||
        curr.ageGroup === "undefined" ||
        curr.ageGroup === "null" ||
        curr.ageGroup === ""
          ? "Not Specified"
          : curr.ageGroup;
      acc[key] = curr.count;
      return acc;
    },
    {}
  );

  const educationLevelData =
    demographicData[0].educationLevelDistribution.reduce(
      (acc: any, curr: any) => {
        // Normalize demographic key
        const key =
          curr.educationLevel === undefined ||
          curr.educationLevel === null ||
          curr.educationLevel === "undefined" ||
          curr.educationLevel === "null" ||
          curr.educationLevel === ""
            ? "Not Specified"
            : curr.educationLevel;
        acc[key] = curr.count;
        return acc;
      },
      {}
    );

  // Process comparison statistics using aggregation
  const comparisonStats: Record<string, any> = {};

  // For each comparison, use aggregation to get stats
  if (study.comparisons && study.comparisons.length > 0) {
    for (const comparison of study.comparisons) {
      const comparisonId = comparison._id.toString();

      // Get response statistics for this comparison
      const comparisonResults = await StudySession.aggregate([
        {
          $match: {
            study: new mongoose.Types.ObjectId(studyId),
            isComplete: true,
            "responses.comparison": new mongoose.Types.ObjectId(comparisonId),
          },
        },
        {
          $project: {
            demographics: 1,
            response: {
              $filter: {
                input: "$responses",
                as: "response",
                cond: {
                  $eq: [
                    "$$response.comparison",
                    new mongoose.Types.ObjectId(comparisonId),
                  ],
                },
              },
            },
          },
        },
        {
          $facet: {
            // Count total responses
            responseCount: [{ $count: "count" }],

            // Demographic breakdown
            demographicBreakdown: [
              {
                $group: {
                  _id: {
                    gender: {
                      $cond: {
                        if: {
                          $eq: [{ $type: "$demographics.gender" }, "missing"],
                        },
                        then: "Not Specified",
                        else: {
                          $cond: {
                            if: {
                              $or: [
                                { $eq: ["$demographics.gender", null] },
                                { $eq: ["$demographics.gender", ""] },
                                { $eq: ["$demographics.gender", "undefined"] },
                                { $eq: ["$demographics.gender", "null"] },
                              ],
                            },
                            then: "Not Specified",
                            else: "$demographics.gender",
                          },
                        },
                      },
                    },
                    age: {
                      $cond: {
                        if: {
                          $eq: [{ $type: "$demographics.age" }, "missing"],
                        },
                        then: "Not Specified",
                        else: {
                          $cond: {
                            if: {
                              $or: [
                                { $eq: ["$demographics.age", null] },
                                { $eq: ["$demographics.age", ""] },
                                { $eq: ["$demographics.age", "undefined"] },
                                { $eq: ["$demographics.age", "null"] },
                              ],
                            },
                            then: "Not Specified",
                            else: "$demographics.age",
                          },
                        },
                      },
                    },
                    education: {
                      $cond: {
                        if: {
                          $eq: [
                            { $type: "$demographics.educationLevel" },
                            "missing",
                          ],
                        },
                        then: "Not Specified",
                        else: {
                          $cond: {
                            if: {
                              $or: [
                                { $eq: ["$demographics.educationLevel", null] },
                                { $eq: ["$demographics.educationLevel", ""] },
                                {
                                  $eq: [
                                    "$demographics.educationLevel",
                                    "undefined",
                                  ],
                                },
                                {
                                  $eq: ["$demographics.educationLevel", "null"],
                                },
                              ],
                            },
                            then: "Not Specified",
                            else: "$demographics.educationLevel",
                          },
                        },
                      },
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $group: {
                  _id: null,
                  genderBreakdown: {
                    $push: {
                      gender: "$_id.gender",
                      count: "$count",
                    },
                  },
                  ageBreakdown: {
                    $push: {
                      age: "$_id.age",
                      count: "$count",
                    },
                  },
                  educationBreakdown: {
                    $push: {
                      education: "$_id.education",
                      count: "$count",
                    },
                  },
                },
              },
            ],

            // Response distribution by demographics
            responseDistribution: [
              {
                $project: {
                  demographics: 1,
                  response: { $arrayElemAt: ["$response", 0] },
                },
              },
              {
                $project: {
                  // Extract demographics directly without intermediate steps
                  gender: {
                    $cond: {
                      if: {
                        $eq: [{ $type: "$demographics.gender" }, "missing"],
                      },
                      then: "Not Specified",
                      else: {
                        $cond: {
                          if: {
                            $or: [
                              { $eq: ["$demographics.gender", null] },
                              { $eq: ["$demographics.gender", ""] },
                              { $eq: ["$demographics.gender", "undefined"] },
                              { $eq: ["$demographics.gender", "null"] },
                            ],
                          },
                          then: "Not Specified",
                          else: "$demographics.gender",
                        },
                      },
                    },
                  },
                  age: {
                    $cond: {
                      if: { $eq: [{ $type: "$demographics.age" }, "missing"] },
                      then: "Not Specified",
                      else: {
                        $cond: {
                          if: {
                            $or: [
                              { $eq: ["$demographics.age", null] },
                              { $eq: ["$demographics.age", ""] },
                              { $eq: ["$demographics.age", "undefined"] },
                              { $eq: ["$demographics.age", "null"] },
                            ],
                          },
                          then: "Not Specified",
                          else: "$demographics.age",
                        },
                      },
                    },
                  },
                  education: {
                    $cond: {
                      if: {
                        $eq: [
                          { $type: "$demographics.educationLevel" },
                          "missing",
                        ],
                      },
                      then: "Not Specified",
                      else: {
                        $cond: {
                          if: {
                            $or: [
                              { $eq: ["$demographics.educationLevel", null] },
                              { $eq: ["$demographics.educationLevel", ""] },
                              {
                                $eq: [
                                  "$demographics.educationLevel",
                                  "undefined",
                                ],
                              },
                              { $eq: ["$demographics.educationLevel", "null"] },
                            ],
                          },
                          then: "Not Specified",
                          else: "$demographics.educationLevel",
                        },
                      },
                    },
                  },
                  // Extract response details based on comparison type
                  binaryResponses: "$response.binaryResponses",
                  ratingResponses: "$response.ratingResponses",
                  singleSelectResponses: "$response.singleSelectResponses",
                  multiSelectResponses: "$response.multiSelectResponses",
                },
              },
            ],
          },
        },
      ]);

      // Process response distribution based on comparison type
      const results = comparisonResults[0];
      const responseCount = results.responseCount[0]?.count || 0;

      // Process demographic breakdown
      const genderBreakdown =
        results.demographicBreakdown.length > 0 &&
        results.demographicBreakdown[0]?.genderBreakdown
          ? results.demographicBreakdown[0].genderBreakdown.reduce(
              (acc: any, curr: any) => {
                // Make sure to access the property correctly
                const key = curr.gender;
                acc[key] = curr.count;
                return acc;
              },
              {}
            )
          : {};

      const ageBreakdown =
        results.demographicBreakdown.length > 0 &&
        results.demographicBreakdown[0]?.ageBreakdown
          ? results.demographicBreakdown[0].ageBreakdown.reduce(
              (acc: any, curr: any) => {
                // Make sure to access the property correctly
                const key = curr.age;
                acc[key] = curr.count;
                return acc;
              },
              {}
            )
          : {};

      const educationBreakdown =
        results.demographicBreakdown.length > 0 &&
        results.demographicBreakdown[0]?.educationBreakdown
          ? results.demographicBreakdown[0].educationBreakdown.reduce(
              (acc: any, curr: any) => {
                // Make sure to access the property correctly
                const key = curr.education;
                acc[key] = curr.count;
                return acc;
              },
              {}
            )
          : {};

      // Process response distribution based on comparison type
      // Get comparison type from the populated comparison document
      let comparisonType = "single-select"; // Default value

      // Check if comparison is populated and has a 'type' property
      if (comparison) {
        // Cast to any for accessing properties safely
        const comparisonDoc = comparison as any;
        if (comparisonDoc.type) {
          comparisonType = comparisonDoc.type;
        }
      }

      const responseDistribution = processResponseDistribution(
        results.responseDistribution,
        comparisonType
      );

      comparisonStats[comparisonId] = {
        responseCount,
        demographicBreakdown: {
          gender: genderBreakdown || {},
          ageGroup: ageBreakdown || {},
          educationLevel: educationBreakdown || {},
        },
        responseDistribution,
      };
    }
  }

  return {
    totalSessions,
    completedSessions,
    incompleteSessions,
    demographicData: {
      gender: genderData,
      ageGroup: ageGroupData,
      educationLevel: educationLevelData,
    },
    comparisonStats,
  };
};

// Helper function to process response distribution based on comparison type
const processResponseDistribution = (
  responses: any[],
  comparisonType: string
) => {
  const distribution: Record<string, any> = {};

  // Log responses data for debugging
  console.log(
    `Processing ${responses.length} responses for ${comparisonType} comparison`
  );

  // Early return if no responses are provided
  if (!responses || responses.length === 0) {
    return distribution;
  }

  // Initialize the structure based on demographic categories
  for (const response of responses) {
    // Debug log to check raw demographic data
    console.log("Raw demographic data from response:", {
      gender: response.gender,
      age: response.age,
      education: response.education,
    });

    // Normalize demographic values to handle undefined, null, or empty values consistently
    // Also handle string representations of 'undefined' and 'null' as they might be stored that way
    const gender =
      !response.gender ||
      response.gender === "undefined" ||
      response.gender === "null"
        ? "Not Specified"
        : response.gender;

    const age =
      !response.age || response.age === "undefined" || response.age === "null"
        ? "Not Specified"
        : response.age;

    const education =
      !response.education ||
      response.education === "undefined" ||
      response.education === "null"
        ? "Not Specified"
        : response.education;

    // Log normalized demographic values
    console.log("Normalized demographic values:", { gender, age, education });

    // Skip this response if we couldn't extract demographic values
    if (!gender || !age || !education) {
      console.log("Skipping response due to missing demographic data");
      continue;
    }

    // Initialize demographic categories if they don't exist
    if (!distribution[gender]) distribution[gender] = {};
    if (!distribution[age]) distribution[age] = {};
    if (!distribution[education]) distribution[education] = {};

    // Initialize data structures based on comparison type
    switch (comparisonType) {
      case "binary":
        if (!distribution[gender].yes) distribution[gender].yes = 0;
        if (!distribution[gender].no) distribution[gender].no = 0;
        if (!distribution[age].yes) distribution[age].yes = 0;
        if (!distribution[age].no) distribution[age].no = 0;
        if (!distribution[education].yes) distribution[education].yes = 0;
        if (!distribution[education].no) distribution[education].no = 0;
        break;

      case "rating":
        if (!distribution[gender].ratings) {
          distribution[gender].ratings = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
          };
        }
        if (!distribution[age].ratings) {
          distribution[age].ratings = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
          };
        }
        if (!distribution[education].ratings) {
          distribution[education].ratings = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
          };
        }

        // Initialize mappings for stimulus-specific ratings
        if (!distribution[gender].stimulusRatings) {
          distribution[gender].stimulusRatings = {};
        }
        if (!distribution[age].stimulusRatings) {
          distribution[age].stimulusRatings = {};
        }
        if (!distribution[education].stimulusRatings) {
          distribution[education].stimulusRatings = {};
        }
        break;

      case "multi-select":
        if (!distribution[gender].selections)
          distribution[gender].selections = {};
        if (!distribution[age].selections) distribution[age].selections = {};
        if (!distribution[education].selections)
          distribution[education].selections = {};
        break;

      case "single-select":
      default:
        if (!distribution[gender].selection)
          distribution[gender].selection = {};
        if (!distribution[age].selection) distribution[age].selection = {};
        if (!distribution[education].selection)
          distribution[education].selection = {};
        break;
    }

    // Process the response data based on comparison type
    switch (comparisonType) {
      case "binary":
        if (response.binaryResponses && response.binaryResponses.length > 0) {
          const isYes = response.binaryResponses[0]?.selected === true;

          if (isYes) {
            distribution[gender].yes++;
            distribution[age].yes++;
            distribution[education].yes++;
          } else {
            distribution[gender].no++;
            distribution[age].no++;
            distribution[education].no++;
          }
        }
        break;

      case "rating":
        if (response.ratingResponses && response.ratingResponses.length > 0) {
          // Process each rating response separately to maintain stimulus-specific data
          for (const ratingResponse of response.ratingResponses) {
            if (
              ratingResponse &&
              ratingResponse.stimulus &&
              ratingResponse.rating
            ) {
              const stimulusId = ratingResponse.stimulus.toString();
              const rating = ratingResponse.rating;
              const ratingKey = rating.toString();

              // Update aggregated ratings (for backward compatibility)
              distribution[gender].ratings[ratingKey]++;
              distribution[age].ratings[ratingKey]++;
              distribution[education].ratings[ratingKey]++;

              // Initialize stimulus-specific rating objects if they don't exist
              if (!distribution[gender].stimulusRatings[stimulusId]) {
                distribution[gender].stimulusRatings[stimulusId] = {
                  "1": 0,
                  "2": 0,
                  "3": 0,
                  "4": 0,
                  "5": 0,
                };
              }
              if (!distribution[age].stimulusRatings[stimulusId]) {
                distribution[age].stimulusRatings[stimulusId] = {
                  "1": 0,
                  "2": 0,
                  "3": 0,
                  "4": 0,
                  "5": 0,
                };
              }
              if (!distribution[education].stimulusRatings[stimulusId]) {
                distribution[education].stimulusRatings[stimulusId] = {
                  "1": 0,
                  "2": 0,
                  "3": 0,
                  "4": 0,
                  "5": 0,
                };
              }

              // Update stimulus-specific rating counts
              distribution[gender].stimulusRatings[stimulusId][ratingKey]++;
              distribution[age].stimulusRatings[stimulusId][ratingKey]++;
              distribution[education].stimulusRatings[stimulusId][ratingKey]++;
            }
          }
        }
        break;

      case "multi-select":
        if (
          response.multiSelectResponses &&
          response.multiSelectResponses.length > 0
        ) {
          for (const selection of response.multiSelectResponses) {
            const selectionId = selection.toString();

            distribution[gender].selections[selectionId] =
              (distribution[gender].selections[selectionId] || 0) + 1;
            distribution[age].selections[selectionId] =
              (distribution[age].selections[selectionId] || 0) + 1;
            distribution[education].selections[selectionId] =
              (distribution[education].selections[selectionId] || 0) + 1;
          }
        }
        break;

      case "single-select":
      default:
        if (response.singleSelectResponses) {
          const selectionId = response.singleSelectResponses.toString();

          distribution[gender].selection[selectionId] =
            (distribution[gender].selection[selectionId] || 0) + 1;
          distribution[age].selection[selectionId] =
            (distribution[age].selection[selectionId] || 0) + 1;
          distribution[education].selection[selectionId] =
            (distribution[education].selection[selectionId] || 0) + 1;
        }
        break;
    }
  }

  return distribution;
};
