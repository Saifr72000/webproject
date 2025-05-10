import express from "express";
import { Stimulus } from "../models/stimuli.model";
import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getStimulusByIdController } from "../controllers/stimulus.controller";

const router = express.Router();

router.get("/files/:id", async (req, res) => {
  try {
    const file = await Stimulus.findById(req.params.id);
    if (!file) return res.status(404).send("Not found");

    // Set correct MIME type so the browser can render the image
    res.setHeader("Content-Type", file.mimetype);

    // Optional: prevent caching issues
    res.setHeader("Cache-Control", "no-store");

    // Optional: CORS-safe headers for image requests
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    return res.send(file.data);
  } catch (error) {
    console.error("Error serving file:", error);
    return res.status(500).send("Server error");
  }
});

const storage = multer.memoryStorage();

router.get("/:id", getStimulusByIdController);

export default router;
