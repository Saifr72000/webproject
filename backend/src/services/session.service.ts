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

export const getSessionById = async (
  sessionId: string | mongoose.Types.ObjectId
): Promise<ISession | null> => {
  return await StudySession.findById(sessionId).populate({
    path: "study",
    populate: {
      path: "owner", // Assuming Study has a `createdBy` field
      model: "User",
      select: "firstName lastName",
    },
  });
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
