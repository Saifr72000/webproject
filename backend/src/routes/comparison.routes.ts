import { Router } from "express";
import {
  createComparison,
  getComparisonByIdController,
} from "../controllers/comparison.controller";
import { createComparisonValidator } from "../validators/comparison.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  stimuliUpload,
  validateStimuliUploads,
} from "../validators/stimuli.validator";
import { deleteComparisonByIdController } from "../controllers/comparison.controller";

const router = Router();

import { getComparisonById } from "../services/comparison.service";



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

router.get("/:comparisonId", getComparisonByIdController);

router.delete("/:id", deleteComparisonByIdController);

export default router;
