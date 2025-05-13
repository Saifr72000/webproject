import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
} from "../services/comparison.service";
import mongoose from "mongoose";
import { Comparison } from "../models/comparison.model";
import { IStimulus, Stimulus } from "../models/stimuli.model";
import multer from "multer";
import { getComparisonById, deleteComparisonById } from "../services/comparison.service";
import { StudySession } from "../models/session.model";
// Create a new comparison with uploaded stimuli
export const createComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  //Authentication validation is done by middleware executed prior to this controller function
  try {
    const { studyId } = req.params;
    const { title, type, stimuliType } = req.body;
    const files = req.files as Express.Multer.File[];

    //Process all uploaded files and create documents out of them
    // ensure that stimulus required fields are present, the ones we pass to service
    const stimuliPromises = files.map((file) =>
      createStimulusService({
        filename: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      })
    );

    // Here we wait for all stimuli to be created
    const stimuli = (await Promise.all(stimuliPromises)) as IStimulus[];
    const stimuliIds = stimuli.map((stimulus) => stimulus._id.toString());

    //If parsedorder is equal to NaN, then set it to 0, otherwise set it to parsedOrder
    // Ensures that order is a number always

    const comparison = await createComparisonService(
      studyId,
      title,
      type,
      stimuliIds,
      stimuliType
    );

    res.status(201).json({
      message: "Comparison created successfully",
      comparison: comparison.toObject(),
    });
  } catch (error) {
    console.error("Error creating study:", error);
    res.status(500).json({
      message: "Failed to create comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getComparisonByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { comparisonId } = req.params;
    const comparison = await getComparisonById(comparisonId);

    if (!comparison) {
      res.status(404).json({
        message: "Comparison not found",
      });
      return;
    }

    res.status(200).json({
      message: "Comparison fetched successfully",
      comparison: comparison,
    });
  } catch (error) {
    console.error("Error fetching comparison:", error);
    res.status(500).json({
      message: "Failed to fetch comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// delete comparison by Id controller
export const deleteComparisonByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteComparisonById(req.params.id);
    res.status(200).json({ message: "Comparison deleted" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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