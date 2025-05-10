import { Request, Response, NextFunction } from "express";
import { Study } from "../models/study.model";
import { saveStimulusMetadata } from "../services/stimuli.service";
import {
  createStudyService,
  getStudyByIdService,
  getAllStudiesService,
} from "../services/study.service";
import mongoose from "mongoose";
import { Stimulus } from "../models/stimuli.model";

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
  }
};

export const deleteStudyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const study = await Study.findById(id);

    if (!study) {
      res.status(404).json({ message: "Study not found" });
      return;
    }

    if (study.status === "active" && study.participantCount > 0 || study.status === "completed") {
      res.status(400).json({ message: "Cannot delete active or completed study"
       });
      return;
    }

    await Study.findByIdAndDelete(id);

    res.status(204).json({ message: "Study deleted successfully" });
  } catch (error) {
    console.error("Error deleting study:", error);
    res.status(500).json({
      message: "Failed to delete study",
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
  }
};

export const getAllStudies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studies = await getAllStudiesService();
    res.status(200).json(studies);
  } catch (error) {
    console.error("Error getting all studies:", error);
    res.status(500).json({
      message: "Failed to get all studies",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const activateStudy = async (
  req: Request,
  res: Response,
) =>{
  const { id } = req.params;
  try{
    const study = await Study.findById(id);
    if (!study) {
      return res.status(404).json({ message: "Study not found" });
    }

    study.status = "active";
    await study.save();

    res.status(200).json(study);
  } catch (error) {
    console.error("failed to activate study:", error);
    res.status(500).json({ message: "server error"});
  }
};

export const completeStudy = async (req: Request, res: Response) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) {
      return res.status(404).json({ message: "Study not found" });
    }

    study.status = "completed";
    await study.save();

    res.status(200).json({ message: "Study marked as completed" });
  } catch (error) {
    console.error("Failed to complete study:", error);
    res.status(500).json({ message: "Server error" });
  }
};

