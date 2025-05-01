import {Comparison,IComparison,ComparisonType,} from "../models/comparison.model";
import mongoose, { Types } from "mongoose";
import { IStimulus, Stimulus } from "../models/stimuli.model";

export const createComparisonService = async (
  studyId: string | Types.ObjectId,
  question: string,
  type: string,
  stimuliIds: string[] | Types.ObjectId[],
  order: number = 0,
  instructions?: string,
  config?: IComparison["config"]

): Promise<IComparison> => {
  try {
    // Authentication is done in the auth.middleware.ts file
    // Validation is done in the comparison.validar.ts file

    // Convert string IDs to ObjectId if needed
    const studyObjectId = typeof studyId === "string" ? new Types.ObjectId(studyId) : studyId;

    const stimuliObjectIds = stimuliIds.map((id) =>
      typeof id === "string" ? new Types.ObjectId(id) : id
    );

    // Create the comparison
    const comparison = new Comparison({
      study: studyObjectId,
      question,
      type,
      stimuli: stimuliObjectIds,
      order,
      instructions,
      config,
    });

    // Simple save without transaction management
    await comparison.save();

    // Populate the stimuli before returning (but exclude binary data)
    await comparison.populate({
      path: "stimuli",
      select: "-data",
    });

    return comparison;
  } catch (error) {
    console.error("Error in createComparison service:", error);
    throw error;
  }
};

export const createStimulusService = async (file: {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}): Promise<IStimulus> => {
  try {
    const stimulus = new Stimulus({
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
      type: file.mimetype.split("/")[0],
    });

    await stimulus.save();

    /* stimulus.url = `/api/stimuli/${stimulus._id}`;
    await stimulus.save(); */

    return stimulus;
  } catch (error) {
    console.error("Error in createStimulus service:", error);
    throw error;
  }
};

 export const getComparisonsByStudy = async (
  studyId: string
): Promise<IComparison[]> => {
  return await Comparison.find({ study: studyId }).sort({ order: 1 });
};

export const getComparisonById = async (
  id: string
): Promise<IComparison | null> => {
  return await Comparison.findById(id).populate({
    path: "stimuli",
    select: "-data",
  });
};

export const updateComparison = async (
  id: string,
  updates: Partial<IComparison>
): Promise<IComparison | null> => {
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

