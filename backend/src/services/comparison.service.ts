import {
  Comparison,
  IComparison,
  ComparisonType,
} from "../models/comparison.model";
import mongoose, { Types } from "mongoose";
import { Stimulus } from "../models/stimuli.model";
import { Study } from "../models/study.model";

interface CreateComparisonParams {
  study: string | Types.ObjectId;
  title: string;
  prompt: string;
  type: ComparisonType;
  stimuliType: string;
  order: number;
  required?: boolean;
  config?: Record<string, any>;
  options: {
    stimulus: string | Types.ObjectId;
    label?: string;
  }[];
}

export const createComparisonService = async (
  params: CreateComparisonParams
): Promise<IComparison> => {
  try {
    const {
      study,
      title,
      prompt,
      type,
      stimuliType,
      order,
      required = true,
      config = {},
      options,
    } = params;

    const studyObjectId =
      typeof study === "string" ? new Types.ObjectId(study) : study;

    const normalizedOptions = options.map((opt) => ({
      stimulus:
        typeof opt.stimulus === "string"
          ? new Types.ObjectId(opt.stimulus)
          : opt.stimulus,
      label: opt.label,
    }));

    const comparison = new Comparison({
      study: studyObjectId,
      title,
      prompt,
      type,
      stimuliType,
      order,
      required,
      config,
      options: normalizedOptions,
    });

    const savedComparison = await comparison.save();

    await Study.findByIdAndUpdate(studyObjectId, {
      $push: { comparisons: savedComparison._id },
    });

    await savedComparison.populate({
      path: "options.stimulus",
      select: "-data -createdAt -updatedAt -__v", // Exclude raw binary and metadata
    });

    return savedComparison;
  } catch (error) {
    console.error("Error in createComparisonService:", error);
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
