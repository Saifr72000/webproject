import { Stimulus } from "../models/stimuli.model";
import { Types } from "mongoose";
import mongoose from "mongoose";

// Define an interface for incoming file data
interface StimulusInput {
  filename: string;
  mimetype: string;
  size: number;
  data: Buffer;
}

// Define the expected file document interface if not already defined
interface IStimulusDocument extends Document {
  _id: Types.ObjectId;
  filename: string;
  mimetype: string;
  size: number;
  data: Buffer;
  comparison: Types.ObjectId[];
  url?: string;
  save: () => Promise<IStimulusDocument>;
}

export const saveStimulusMetadata = async (
  stimulusData: StimulusInput,
  comparisonId: Types.ObjectId | null = null
): Promise<IStimulusDocument> => {
  const { filename, mimetype, size, data } = stimulusData;

  const stimulus = new Stimulus({
    filename,
    mimetype,
    size,
    data,
    comparison: comparisonId ? comparisonId : null,
  });
  const savedStimulus = (await stimulus.save()) as unknown as IStimulusDocument;

  // Add the correct URL using the saved _id
  savedStimulus.url = `/api/files/${savedStimulus._id}`;
  await savedStimulus.save();

  return savedStimulus;
};

export const attachStimulusToComparison = async (
  stimulusId: Types.ObjectId,
  comparisonId: Types.ObjectId
): Promise<IStimulusDocument | null> => {
  return await Stimulus.findByIdAndUpdate(
    stimulusId,
    { $addToSet: { comparison: comparisonId } },
    { new: true }
  );
};

export const getStimulusById = async (
  id: Types.ObjectId
): Promise<IStimulusDocument | null> => {
  return await Stimulus.findById(id);
};


export const createStimulusFromFile = async (
  file: Express.Multer.File,
  comparisonId: Types.ObjectId
) => {
  const stimulus = new Stimulus({
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    data: file.buffer,
    comparison: comparisonId,
    url: `/api/files/${new mongoose.Types.ObjectId()}`
  });

  await stimulus.save();
  return stimulus._id;
};