import { Request, Response } from "express";
import { getStimulusById } from "../services/stimuli.service";
import mongoose from "mongoose";

export const getStimulusByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id || typeof id !== "string" || id.length !== 24) {
      res.status(400).send("Invalid file ID");
      return;
    }

    const fileId = new mongoose.Types.ObjectId(id);
    const file = await getStimulusById(fileId);

    if (!file) {
      res.status(404).send("File not found");
      return;
    }

    res.set("Content-Type", file.mimetype);
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.send(file.data);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};