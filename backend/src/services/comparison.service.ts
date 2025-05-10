import {
  Comparison,
  IComparison,
  ComparisonType,
} from "../models/comparison.model";
import mongoose, { Types } from "mongoose";
import { Stimulus } from "../models/stimuli.model";
import { Study } from "../models/study.model";

export const createComparisonService = async (
  studyId: string | Types.ObjectId,
  title: string,
  type: string,
  stimuliIds: string[] | Types.ObjectId[],
  stimuliType: string
) => {
  try {
    // Convert string IDs to ObjectId if needed
    const studyObjectId =
      typeof studyId === "string" ? new Types.ObjectId(studyId) : studyId;

    const stimuliObjectIds = stimuliIds.map((id) =>
      typeof id === "string" ? new Types.ObjectId(id) : id
    );

    // Create the comparison
    const comparison = new Comparison({
      study: studyObjectId,
      title,
      type,
      stimuli: stimuliObjectIds,
      stimuliType,
      options: stimuliObjectIds.map((stimulusId) => ({ stimulus: stimulusId })),
    });

    // Simple save without transaction management
    const savedComparison = await comparison.save();

    await Study.findByIdAndUpdate(studyId, {
      $push: { comparisons: savedComparison._id },
    });

    // Populate the stimuli before returning (but exclude binary data)
    await comparison.populate({
      path: "options.stimulus",
      select: "-data -filename -size -createdAt -updatedAt -__v",
    });

    return comparison;
  } catch (error) {
    console.error("Error in createComparison service:", error);
    throw error;
  }
};

export const createStimulusService = async (file: {
  filename: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}) => {
  try {
    const stimulus = new Stimulus({
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
      type: file.mimetype.split("/")[0],
    });

    const savedStimulus = await stimulus.save();
    savedStimulus.url = `/api/files/${savedStimulus._id}`;
    await savedStimulus.save();

    return savedStimulus;
  } catch (error) {
    console.error("Error in createStimulus service:", error);
    throw error;
  }
};

/* export const getComparisonsByStudy = async (
  studyId: string
): Promise<IComparison[]> => {
  return await Comparison.find({ study: studyId }).sort({ order: 1 });
};

export const getComparisonById = async (
  id: string
): Promise<IComparison[] | null> => {
  return await Comparison.findById(id);
};

export const updateComparison = async (
  id: string,
  updates: Partial<{
    question: string;
    instructions: string;
    type: ComparisonType;
    stimuli: string[];
    order: number;
    config: {
      minSelections?: number;
      maxSelections?: number;
      allowPartialRanking?: boolean;
    };
  }>
): Promise<IComparison | null> => {
  // Convert stimuli IDs to ObjectIds if present
  const updateData: any = { ...updates };
  if (updates.stimuli) {
    updateData.stimuli = updates.stimuli.map((id) => new Types.ObjectId(id));
  }

  return await Comparison.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
};

// Revise this function, because we need to test if for cascation.
// I.e, it gets removed from the collection of studies.
export const deleteComparison = async (id: string): Promise<boolean> => {
  const result = await Comparison.findByIdAndDelete(id);
  return !!result;
};
 */
