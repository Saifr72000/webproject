import {
  Comparison,
  IComparison,
  ComparisonType,
   IComparisonOption
} from "../models/comparison.model";
import mongoose, { Types } from "mongoose";
import { Stimulus } from "../models/stimuli.model";
import { Study } from "../models/study.model";

import { createStimulusFromFile } from "./stimuli.service";


interface UpdateComparisonParams {
  comparisonId: string;
  body: any;
  files?: Express.Multer.File[];
}


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

export const getComparisonById = async (
  id: string
): Promise<IComparison | null> => {
  return await Comparison.findById(id).populate({
    path: "options.stimulus",
    select: "-data -filename -size -createdAt -updatedAt -__v",
  });
};

// ... existing code ...

export const deleteComparisonByIdService = async (
  comparisonId: string
): Promise<void> => {
  try {
    // Find the comparison
    const comparison = await Comparison.findById(comparisonId);
    if (!comparison) {
      throw new Error("Comparison not found");
    }


    const study = await Study.findById(comparison.study);
    if (!study) {
      throw new Error("Study not found");
    }

    if (study.status === "active" || study.status === "completed") {
      throw new Error("Cannot delete comparison from an active or completed study");
    }


    const stimulusIds = comparison.options?.map(opt => opt.stimulus) || [];

    // Delete stimuli
    if (stimulusIds.length > 0) {
      await Stimulus.deleteMany({ _id: { $in: stimulusIds } });
    }

    // Remove the comparison from the study's comparisons array
    await Study.findByIdAndUpdate(
      comparison.study,
      { $pull: { comparisons: comparisonId } }
    );

    // Delete the comparison
    await Comparison.findByIdAndDelete(comparisonId);
  } catch (error) {
    throw error;
  }
};



export const updateComparisonService = async ({
  comparisonId,
  body,
  files,
}: UpdateComparisonParams): Promise<IComparison> => {
  const comparisonDoc = await Comparison.findById(comparisonId);
  if (!comparisonDoc) throw new Error("Comparison not found");

  const removedIds = body["removedStimuli[]"] || body.removedStimuli;
  const removedArray: string[] = Array.isArray(removedIds)
    ? removedIds
    : removedIds ? [removedIds] : [];

  const comparison = comparisonDoc as mongoose.Document<unknown, {}, IComparison> & IComparison;

  // Update fields
  if (body.title) comparison.title = body.title;
  if (body.type) comparison.type = body.type;
  if (body.stimuliType) comparison.stimuliType = body.stimuliType;

  // Remove old stimuli
  if (removedArray.length > 0) {
    comparison.options = comparison.options.filter((opt) => {
      const idStr =
        typeof opt.stimulus === "string"
          ? opt.stimulus
          : (opt.stimulus as Types.ObjectId).toString();
      return !removedArray.includes(idStr);
    });
  }

  // Add new stimuli
  if (files && files.length > 0) {
    const newOptions: IComparisonOption[] = [];

    for (const file of files) {
      if (!file || !file.buffer) {
        console.warn("Skipping file without buffer:", file?.originalname);
        continue;
      }

      const stimulusId = await createStimulusFromFile(file, comparison._id as Types.ObjectId);
      newOptions.push({ stimulus: stimulusId as Types.ObjectId });
    }

    const existingOptions: IComparisonOption[] = comparison.options || [];
    comparison.options = [...existingOptions, ...newOptions];
  }

  await comparison.save();

  await comparison.populate({
    path: "options.stimulus",
    model: "Stimulus",
    select: "filename mimetype url",
  });

  return comparison;
};


export const deleteComparisonById = async (id: string): Promise<void> => {
  try {
    // Find the comparison
    const comparison = await Comparison.findById(id);
    if (!comparison) throw new Error("Comparison not found");

    // Check study status
    const study = await Study.findById(comparison.study);
    if (!study) throw new Error("Study not found");
    if (["active", "completed"].includes(study.status)) {
      throw new Error("Cannot delete comparison from active/completed study");
    }


    const stimulusIds = comparison.options?.map(opt => opt.stimulus) || [];


    if (stimulusIds.length > 0) {
      await Stimulus.deleteMany({ _id: { $in: stimulusIds } });
    }

    
    await Study.findByIdAndUpdate(
      comparison.study,
      { $pull: { comparisons: id } }
    );

    // Delete the comparison
    await Comparison.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

