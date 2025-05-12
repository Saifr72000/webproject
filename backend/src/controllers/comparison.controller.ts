import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulus,
  getComparisonById,

} from "../services/comparison.service";
import { IStimulus } from "../models/stimuli.model";
import { Comparison } from "../models/comparison.model";
import { Study } from "../models/study.model";
import { deleteComparisonById } from "../services/comparison.service";


export const createComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studyId } = req.params;
    const {
      title,
      prompt,
      type,
      stimuliType,
      order,
      required = true,
      config,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    // Create Stimulus documents from uploaded files
    const stimuli = (await Promise.all(
      files.map((file) =>
        createStimulus({
          filename: file.originalname,
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        })
      )
    )) as IStimulus[];

    // Build options array from uploaded stimuli
    const options = stimuli.map((stimulus) => ({
      stimulus: stimulus._id,
      label: stimulus.filename, // optional fallback
    }));

    const comparison = await createComparisonService({
      study: studyId,
      title,
      prompt,
      type,
      stimuliType,
      order: parseInt(order, 10) || 0,
      required,
      config: config || {},
      options,
    });

    res.status(201).json({
      message: "Comparison created successfully",
      comparison: comparison.toObject(),
    });
  } catch (error) {
    console.error("Error creating comparison:", error);
    res.status(500).json({
      message: "Failed to create comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteComparisonByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteComparisonById(id);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error deleting comparison:", err.message);
    if (err.message.includes("not found")) {
      res.status(404).json({ message: err.message });
    } else if (err.message.includes("Cannot delete")) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const getComparisonByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const comparison = await getComparisonById(id);

    if (!comparison) {
      res.status(404).json({ message: "Comparison not found" });
      return;
    }

    res.status(200).json(comparison);
  } catch (error) {
    console.error("Error fetching comparison:", error);
    res.status(500).json({
      message: "Failed to fetch comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};