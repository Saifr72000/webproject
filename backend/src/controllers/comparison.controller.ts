import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
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

export const deleteComparisonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comparison = await Comparison.findById(id);
    if (!comparison) {
      return res.status(404).json({ message: "Comparison not found" });
    }

    const study = await Study.findById(comparison.study);
    if (!study) {
      return res.status(404).json({ message: "Study not found" });
    }

    if (study.status === "active" || study.status === "completed") {
      return res.status(400).json({ message: "Cannot delete active or closed study" });
    }

    const deleted = await Comparison.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Comparison not found" });
    }

    // Optional: remove from study if needed
    await Study.updateOne(
      { comparisons: id },
      { $pull: { comparisons: id } }
    );

    return res.status(200).json({ message: "Comparison deleted" });
  } catch (err) {
    console.error("Error deleting comparison:", err);
    return res.status(500).json({ message: "Server error" });
  }
};