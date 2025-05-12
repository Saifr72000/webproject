import { Request, Response } from "express";
import { getStimulusById } from "../services/stimuli.service";
import mongoose from "mongoose";

export const getStimulusByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    // Fetch file from database
    const file = await getStimulusById(fileId);

    if (!file) {
      res.status(404).send("File not found");
      return;
    }

    // Set appropriate content type
    res.set("Content-Type", file.mimetype);
    // Add Cross-Origin Resource Policy header
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    // Send the file data
    res.send(file.data);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};