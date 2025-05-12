import {
  Comparison,
  IComparison,
  ComparisonType,
} from "../models/comparison.model";
import mongoose, { Types } from "mongoose";
import { Stimulus } from "../models/stimuli.model";
import { Study } from "../models/study.model";

type CreateComparisonInput = {
  study: string | Types.ObjectId;
  title: string;
  prompt?: string;
  type: string;
  stimuliType: string;
  order?: number;
  required?: boolean;
  config?: Record<string, any>;
  options?: { stimulus: string | Types.ObjectId }[];
};

export const createComparisonService = async ({
  study,
  title,
  prompt,
  type,
  stimuliType,
  order = 0,
  required = false,
  config = {},
  options = [],
}: CreateComparisonInput) => {
  try {
    const studyObjectId =
      typeof study === "string" ? new Types.ObjectId(study) : study;

    const optionStimuliIds = options.map((o) =>
      typeof o.stimulus === "string" ? new Types.ObjectId(o.stimulus) : o.stimulus
    );

    const comparison = new Comparison({
      study: studyObjectId,
      title,
      prompt,
      type,
      stimuliType,
      order,
      required,
      config,
      options: optionStimuliIds.map((id) => ({ stimulus: id })),
    });

    const savedComparison = await comparison.save();

    await Study.findByIdAndUpdate(studyObjectId, {
      $push: { comparisons: savedComparison._id },
    });

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

export const getComparisonById = async (
  id: string
): Promise<IComparison | null> => {
  return await Comparison.findById(id).populate({
    path: "options.stimulus",
    select: "-data -filename -size -createdAt -updatedAt -__v",
  });
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
