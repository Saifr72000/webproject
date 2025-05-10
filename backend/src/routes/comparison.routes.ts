import { Router } from "express";
import { createComparison } from "../controllers/comparison.controller";
import { createComparisonValidator } from "../validators/comparison.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  stimuliUpload,
  validateStimuliUploads,
} from "../validators/stimuli.validator";

const router = Router();

import multer from "multer";

// Multer setup for handling file uploads in memory (MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// create comparison route
router.post(
  "/:studyId",
  authenticateUser,
  stimuliUpload.array("stimuli"),
  validateStimuliUploads,
  createComparisonValidator,
  validateRequest,
  createComparison
);

export default router;
