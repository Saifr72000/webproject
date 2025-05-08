import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
} from "../services/comparison.service";
import { IStimulus } from "../models/stimuli.model";

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
