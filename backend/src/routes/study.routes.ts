import { Router } from "express";
import { createStudy, getStudyById } from "../controllers/study.controller";
import { createStudyValidator } from "../validators/study.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import { createComparisonValidator } from "../validators/comparison.validator";
import { createComparison } from "../controllers/comparison.controller";
import {
  stimuliUpload,
  validateStimuliUploads,
} from "../validators/stimuli.validator";
import { parseConfigIfNeeded } from "../middlewares/parseConfig.middleware";

const router = Router();

// create study route
router.post(
  "/register/study",
  authenticateUser,
  createStudyValidator,
  validateRequest,
  createStudy
);

// get study by id route
// this is currently giving error because we havent handled the case of
// fetching studies that does not contain comparisons because we populate comparisons
// in the getStudyById service
router.get("/:id", authenticateUser, getStudyById);

// create comparison route
router.post(
  "/:studyId/comparisons",
  authenticateUser,
  stimuliUpload.array("stimuli"),
  parseConfigIfNeeded,          
  validateStimuliUploads,
  createComparisonValidator,
  validateRequest,
  createComparison
);

export default router;
