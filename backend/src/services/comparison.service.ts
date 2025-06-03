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

    const studyObjectId =
      typeof studyId === "string" ? new Types.ObjectId(studyId) : studyId;

    const stimuliObjectIds = stimuliIds.map((id) =>
      typeof id === "string" ? new Types.ObjectId(id) : id
    );

    const comparison = new Comparison({
      study: studyObjectId,
      title,
      type,
      stimuli: stimuliObjectIds,
      stimuliType,
      options: stimuliObjectIds.map((stimulusId) => ({ stimulus: stimulusId })),
    });


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


export const deleteComparisonByIdService = async (
  comparisonId: string
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  

  try {

    const comparison = await Comparison.findById(comparisonId);

    if (!comparison) {
      throw new Error("Comparison not found");
    }

    
    const studyId = comparison.study;

    // Extract stimulus IDs from the options array
    const stimulusIds = comparison.options.map((option) => option.stimulus);

    // Delete the comparison
    await Comparison.findByIdAndDelete(comparisonId).session(session);

    // Remove the comparison from the study's comparisons array
    await mongoose
      .model("Study")
      .findByIdAndUpdate(
        studyId,
        { $pull: { comparisons: comparisonId } },
        { session }
      );


    if (stimulusIds.length > 0) {
      await Stimulus.deleteMany({ _id: { $in: stimulusIds } }).session(session);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
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
  const comparison = await Comparison.findById(id);
  if (!comparison) throw new Error("Comparison not found");

  const study = await Study.findById(comparison.study);
  if (!study) throw new Error("Study not found");

  if (["active", "completed"].includes(study.status)) {
    throw new Error("Cannot delete comparison from active/completed study");
  }

  await Comparison.findByIdAndDelete(id);
};

