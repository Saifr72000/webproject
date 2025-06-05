import { Study, IStudy } from "../models/study.model";
import { IComparison, ComparisonType } from "../models/comparison.model";
import { createComparisonService } from "./comparison.service";
import mongoose, { Types } from "mongoose";
import { Comparison } from "../models/comparison.model";
import { Stimulus } from "../models/stimuli.model";

// To get the complete study with comparisons and stimuli populated,
// remember we need to add pagination to the comparisons.

export const createStudyService = async (
  name: string,
  description: string,
  ownerId: string | Types.ObjectId,
  coverImageId: string | Types.ObjectId
) => {
  // Convert string IDs to ObjectId if needed
  const ownerObjectId =
    typeof ownerId === "string" ? new Types.ObjectId(ownerId) : ownerId;

  // Generate a unique public ID for the study

  const studyData: any = {
    name,
    description,
    owner: ownerObjectId,
    coverImage: coverImageId,
  };

  const newStudy = new Study(studyData);
  await newStudy.save();

  return newStudy;
};

export const getStudyByIdService = async (
  id: string,
  userId: string
): Promise<IStudy | null> => {
  return await Study.findOne({
    _id: id,
    owner: userId,
  })
    .populate({
      path: "comparisons",
      populate: {
        path: "options.stimulus",
        model: "Stimulus",
        select: "filename mimetype url",
      },
    })
    .populate({
      path: "owner",
      select: "firstName lastName email",
    });
};
export const getStudyByIdSessionService = async (
  id: string
): Promise<IStudy | null> => {
  return await Study.findOne({
    _id: id,
  })
    .populate({
      path: "comparisons",
      populate: {
        path: "options.stimulus",
        model: "Stimulus",
        select: "filename mimetype url",
      },
    })
    .populate({
      path: "owner",
      select: "firstName lastName",
    });
};

export const getAllStudiesService = async (
  userId: string
): Promise<IStudy[] | null> => {
  return await Study.find({ owner: userId }).populate({
    path: "comparisons",
  });
};

export const deleteStudyByIdService = async (
  studyId: string
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const study = await Study.findById(studyId);

    if (!study) {
      throw new Error("Study not found");
    }

    // Find all comparisons for the study
    const comparisons = await Comparison.find({ study: studyId });

    // Collect all stimuli IDs
    const stimulusIds = comparisons
      .flatMap((c) => c.options?.map((opt) => opt.stimulus))
      .filter(Boolean);

    // Delete all associated stimuli
    if (stimulusIds.length > 0) {
      await Stimulus.deleteMany({ _id: { $in: stimulusIds } }).session(session);
    }

   
    await Comparison.deleteMany({ study: studyId }).session(session);

    // delete the study
    await Study.findByIdAndDelete(studyId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};



export const activateStudyService = async (studyId: string): Promise<IStudy> => {
  const study = await Study.findById(studyId);
  if (!study) {
    throw new Error("Study not found");
  }

  study.status = "active";
  return await study.save();
};

export const deactivateStudyService = async (studyId: string): Promise<IStudy> => {
  const study = await Study.findById(studyId);
  if (!study) {
    throw new Error("Study not found");
  }

  study.status = "draft";
  return await study.save();
};



/* export const deleteStudyByIdService = async (
  studyId: string
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the study to get its comparisons before deletion
    const study = await mongoose.model("Study").findById(studyId);

    if (!study) {
      throw new Error("Study not found");
    }

    // Delete all associated comparisons
    const comparisons = await Comparison.find({ study: studyId });

    // Get all stimuli IDs from all comparisons
    const stimuliIds: Types.ObjectId[] = [];

    // Safely extract stimuli IDs
    comparisons.forEach((comparison) => {
      if (comparison.stimuli && Array.isArray(comparison.stimuli)) {
        stimuliIds.push(...comparison.stimuli);
      }
    });

    // Delete all associated stimuli if there are any
    if (stimuliIds.length > 0) {
      await Stimulus.deleteMany({ _id: { $in: stimuliIds } }).session(session);
    }

    // Delete all comparisons
    await Comparison.deleteMany({ study: studyId }).session(session);

    // Delete the study itself
    await mongoose.model("Study").findByIdAndDelete(studyId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
 */
// need to implement edit studies and update studies as well.
