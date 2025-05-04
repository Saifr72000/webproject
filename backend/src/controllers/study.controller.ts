import { Request, Response, NextFunction } from "express";
import { Study } from "../models/study.model";
import { saveStimulusMetadata } from "../services/stimuli.service";
import {
  createStudyService,
  getStudyByIdService,
} from "../services/study.service";
import mongoose from "mongoose";

export const createStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description } = req.body;

    let coverImageId;

    if (req.file) {
      const fileData = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
      };
      const savedFile = await saveStimulusMetadata(fileData);

      savedFile.url = `/api/files/${savedFile._id}`;
      await savedFile.save();

      coverImageId = savedFile?._id;
    }

    // Get the user ID from the authenticated user
    const userId = req.user?.userId as string;

    // Create the study using the service
    const study = await createStudyService(
      name,
      description,
      userId,
      coverImageId as mongoose.Types.ObjectId
    );

    // Return the created study
    res.status(201).json(study);
  } catch (error) {
    console.error("Error creating study:", error);
    res.status(500).json({
      message: "Failed to create study",
      error: error instanceof Error ? error.message : String(error),
    });
    next();
  }
};

export const getStudyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const study = await getStudyByIdService(id);

    res.status(200).json(study);
  } catch (error) {
    console.error("Error getting study by ID:", error);
    res.status(500).json({
      message: "Failed to get study by ID",
      error: error instanceof Error ? error.message : String(error),
    });
    next();
  }
};
