
import { Stimulus } from "../models/stimuli.model";
import multer from "multer";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getStimulusByIdController } from "../controllers/stimulus.controller";
import express, { Request, Response, Router } from "express";

const router = express.Router();

router.get("/files/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await Stimulus.findById(req.params.id);
    if (!file) {
      res.status(404).send("Not found");
      return;
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(file.data);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send("Server error");
  }
});



const storage = multer.memoryStorage();

router.get("/:id", getStimulusByIdController);

export default router;
