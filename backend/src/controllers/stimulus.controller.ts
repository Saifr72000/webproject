import { Request, Response } from "express";
import { getStimulusById } from "../services/stimuli.service";
import mongoose from "mongoose";

export const getStimulusByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid file ID format" });
      return;
    }

    // Check if client has cached version
    const clientETag = req.headers["if-none-match"];
    if (clientETag === id) {
      res.status(304).end();
      return;
    }

    const file = await getStimulusById(new mongoose.Types.ObjectId(id));

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    // Set content type
    res.setHeader("Content-Type", file.mimetype);

    // Set CORS headers for cross-origin requests
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Set moderate caching headers (1 hour instead of 1 year)
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");

    // Use file ID as ETag for cache validation
    res.setHeader("ETag", id);

    // Add Last-Modified header for better cache validation (using createdAt from timestamps)
    res.setHeader(
      "Last-Modified",
      (file as any).createdAt?.toUTCString() || new Date().toUTCString()
    );

    // Send the file data
    res.send(file.data);
  } catch (error) {
    console.error("Error serving stimulus:", error);
    res.status(500).json({ message: "Error retrieving file" });
  }
};
