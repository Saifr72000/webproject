import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
} from "../services/comparison.service";
import mongoose from "mongoose";
import { Comparison } from "../models/comparison.model";
import { IStimulus, Stimulus } from "../models/stimuli.model";
import multer from "multer";

// Create a new comparison with uploaded stimuli
export const createComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  //Authentication validation is done by middleware executed prior to this controller function
  try {
    const { studyId } = req.params;
    const { question, type, order, instructions, config } = req.body;
    const files = req.files as Express.Multer.File[];

    //Process all uploaded files and create documents out of them
    // ensure that stimulus required fields are present, the ones we pass to service
    const stimuliPromises = files.map((file) =>
      createStimulusService({
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      })
    );

    // Here we wait for all stimuli to be created
    const stimuli = (await Promise.all(stimuliPromises)) as IStimulus[];
    const stimuliIds = stimuli.map((stimulus) => stimulus._id.toString());

    // ensuyre parsing is done of the order value, from string to number
    const parsedOrder = order ? parseInt(order as string) : 0;
    //If parsedorder is equal to NaN, then set it to 0, otherwise set it to parsedOrder
    // Ensures that order is a number always
    const orderValue = isNaN(parsedOrder) ? 0 : parsedOrder;

    const comparison = await createComparisonService(
      studyId,
      question,
      type,
      stimuliIds,
      orderValue,
      instructions,
      config
    );

    res.status(201).json({
      message: "Comparison created successfully",
      comparison: comparison.toObject(),
    });
  } catch (error) {
    console.error("Error creating study:", error);
    res.status(500).json({
      message: "Failed to create study",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
/* const storage = multer.memoryStorage();

const fileFilter = (
  req: any, //because I we do not know how multer will handle the request object
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, //10mb limit
});

export const createComparison = async (req: Request, res: Response) => {
  try {
    const { studyId } = req.params;
    const { question, type, order, instructions, config } = req.body;

    //validate the inputs
    if (!question || !type) {
      return res
        .status(400)
        .json({ message: "Question and type are required" });
    }

    // Process the uploaded files
    const files = req.files as Express.Multer.File[];
    const stimuliIds: string[] = [];

    if (files && files.length > 0) {
      // create stimulus documents for each uploaded file
      for (const file of files) {
        // creating stimulus document per file to mongodb
        const stimulus = await Stimulus.create({
          name: file.originalname,
          type: file.mimetype.split("/")[0], // e.g. image, video, audio, pdf
          mimetype: file.mimetype,
          size: file.size,
          data: file.buffer,
        });

        // Use type assertion to help TypeScript understand the structure
        // @ts-ignore - Ignore TypeScript error for MongoDB document _id
        const stimulusId = stimulus._id.toString();

        // Update the stimulus with its URL using mongodb generated id
        // @ts-ignore
        stimulus.url = `/api/stimuli/${stimulusId}`;
        await stimulus.save();
        stimuliIds.push(stimulusId);
      }
    }

    // Create the entire comparison record
    const parsedOrder = parseInt(order as string);
    const orderValue = isNaN(parsedOrder) ? 0 : parsedOrder;

    const comparison = await Comparison.create({
      question,
      type,
      study: studyId, // Note: your model uses 'study', not 'studyId'
      stimuli: stimuliIds, // Note: your model uses 'stimuli', not 'stimuliIds'
      order: orderValue,
      instructions,
      config,
    });
    await comparison.populate({
      path: "stimuli",
      select: "-data", //exclude the binary data from the response
    });
  } catch (error) {
    console.error("Error adding comparison", error);
    return res.status(500).json({
      message: "Failed to add comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}; */
