import { Request, Response } from "express";
import {
  createComparisonService,
  createStimulusService,
  getComparisonsByStudy,
  getComparisonById,
  updateComparison,
  deleteComparison,
} from "../services/comparison.service";
import { IStimulus } from "../models/stimuli.model";


export const createComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studyId } = req.params;
    const { question, type, order, instructions } = req.body;
    let { config } = req.body;

    // Parse config if it comes as a JSON string (e.g., from multipart/form-data)
    if (typeof config === "string") {
      try {
        config = JSON.parse(config);
      } catch (e) {
        res.status(400).json({
          message: "Invalid JSON in config field",
          error: e instanceof Error ? e.message : String(e),
        });
        return; //  Stop here after sending error response
      }
    }

    const files = req.files as Express.Multer.File[];

    const stimuliPromises = files.map((file) =>
      createStimulusService({
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      })
    );

    const stimuli: IStimulus[] = await Promise.all(stimuliPromises);
    const stimuliIds = stimuli.map((stimulus) => stimulus._id.toString());

    const orderValue = isNaN(parseInt(order)) ? 0 : parseInt(order);

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
    console.error("Error creating comparison:", error);
    res.status(500).json({
      message: "Failed to create comparison",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getComparisons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studyId } = req.params;
    const comparisons = await getComparisonsByStudy(studyId);
    res.status(200).json(comparisons);
  } catch (error) {
    console.error("Error retrieving comparisons:", error);
    res.status(500).json({
      message: "Failed to retrieve comparisons",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getComparisonId = async (req: Request, res: Response): Promise<void> => {
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

export const updateComparisonController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedComparison = await updateComparison(id, updates);
    if (!updatedComparison) {
      res.status(404).json({ message: "Comparison not found" });
      return;
    }

    res.status(200).json(updatedComparison);
  } catch (error) {
    console.error("Error updating comparison:", error);
    res.status(500).json({ message: "Failed to update comparison" });
  }
};

export const deleteComparisonController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedComparison = await deleteComparison(id);
    if (!deletedComparison) {
      res.status(404).json({ message: "Comparison not found" });
      return;
    }

    res.status(200).json({ message: "Comparison deleted successfully" });
  } catch (error) {
    console.error("Error deleting comparison:", error);
    res.status(500).json({ message: "Failed to delete comparison" });
  }
};

    




/* const storage = multer.memoryStorage(); (moved to middleware)

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
