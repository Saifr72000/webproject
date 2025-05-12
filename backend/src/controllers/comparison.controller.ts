import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
  getComparisonById
} from "../services/comparison.service";
import { IStimulus } from "../models/stimuli.model";
import { Comparison } from "../models/comparison.model";
import { Study } from "../models/study.model";
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
        createStimulusService({
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

export const deleteComparisonById = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;

    const comparison = await Comparison.findById(id);
    if (!comparison) {
       res.status(404).json({ message: "Comparison not found" });
       return;
    }

    const study = await Study.findById(comparison.study);
    if (!study) {
       res.status(404).json({ message: "Study not found" });
       return;
    }

    if (study.status === "active" || study.status === "completed") {
       res.status(400).json({ message: "Cannot delete active or closed study" });
       return;
    }

    const deleted = await Comparison.findByIdAndDelete(id);
    if (!deleted) {
       res.status(404).json({ message: "Comparison not found" });
       return;
    }

    // Optional: remove from study if needed
    await Study.updateOne(
      { comparisons: id },
      { $pull: { comparisons: id } }
    );

     res.status(200).json({ message: "Comparison deleted" });
  } catch (err) {
    console.error("Error deleting comparison:", err);
     res.status(500).json({ message: "Server error" });
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