import express from "express";
import { Router } from "express";
import { body } from "express-validator";
import { createComparison } from "../controllers/comparison.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import { deleteComparisonById } from "../controllers/comparison.controller";
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

router.delete("/:id", authenticateUser, deleteComparisonById);

export default router;
