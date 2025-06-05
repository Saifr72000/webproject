import { Request, Response, NextFunction } from "express";
import { Study } from "../models/study.model";
import { saveStimulusMetadata } from "../services/stimuli.service";
import {
  createStudyService,
  getStudyByIdService,
  getAllStudiesService,
  deleteStudyByIdService,
  getStudyByIdSessionService,
  activateStudyService,
  deactivateStudyService,
} from "../services/study.service";
import mongoose from "mongoose";
import { StudySession } from "../models/session.model";

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

export const getStudyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const study = await getStudyByIdService(id, userId);

    res.status(200).json(study);
  } catch (error) {
    console.error("Error getting study by ID:", error);
    res.status(500).json({
      message: "Failed to get study by ID",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
export const getStudyByIdSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const study = await getStudyByIdSessionService(id);

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
    const userId = req.user?.userId;
    const studies = await getAllStudiesService(userId);
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
  res: Response
): Promise<void> => {
  try {
    const study = await activateStudyService(req.params.id);
    res.status(200).json(study);
  } catch (error: unknown) {
    console.error("Failed to activate study:", error);
    if (error instanceof Error) {
      if (error.message === "Study not found") {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to publish study" });
    }
  }
};

export const deactivateStudy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const study = await deactivateStudyService(req.params.id);
    res.status(200).json(study);
  } catch (error: unknown) {
    console.error("Failed to deactivate study:", error);
    if (error instanceof Error) {
      if (error.message === "Study not found") {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to unpublish study" });
    }
  }
};

export const deleteStudyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const study = await Study.findById(id);
    if (!study) {
      res.status(404).json({ message: "study not found" });
      return;
    }

    if (study.status === "completed") {
      console.log("Blocked: completed study");
      res.status(400).json({ message: "cannot delete a completed study" });
      return;
    }

    if (study.participantCount > 0) {
      console.log("blocked: participants more than 0");
      res
        .status(400)
        .json({ message: "cannot delete a study with participants" });
      return;
    }


    await deleteStudyByIdService(id);

    res.status(204).json({ message: "Study deleted successfully" });
  } catch (error) {
    console.error("Error deleting study:", error);
    res.status(500).json({
      message: "Failed to delete study",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const checkSessionExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const session = await StudySession.findOne({ study: req.params.id });
    res.status(200).json({ sessionExists: !!session });
  } catch (err) {
    res.status(500).json({ message: "Error checking session" });
  }
};
