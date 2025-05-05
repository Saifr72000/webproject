// src/routes/stimulus.routes.ts
import { Router, Request, Response } from "express";
import { Stimulus } from "../models/stimuli.model";

const stimulusRouter = Router();


stimulusRouter.get("/:id", async (req: Request, res: Response) => { // Get a stimulus by ID from the database and send it as a response
  try {
    const stimulus = await Stimulus.findById(req.params.id); // Fetches the stimulus document from MongoDB using the ID provided in the URL.
    if (!stimulus) {
      res.status(404).send("Stimulus not found");
      return;
    }
    res.set("Content-Type", stimulus.mimetype); // Sets the Content-Type header to the mimetype of the stimulus document. like image/jpeg, video/mp4, etc.
    res.send(stimulus.data); // Sends the binary file data stored in MongoDB (Buffer) as the response body.
  } catch (error) {
    console.error("Failed to get stimulus:", error);
    res.status(500).send("Server error");
  }
});

export default stimulusRouter;
