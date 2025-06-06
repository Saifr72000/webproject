import { Router } from "express";
import {
  createStudy,
  getStudyById,
  getAllStudies,
  getStudyByIdSession,
  activateStudy,
  deactivateStudy,
  checkSessionExists,
  deleteStudyById,
} from "../controllers/study.controller";
import { createStudyValidator } from "../validators/study.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import { createComparisonValidator } from "../validators/comparison.validator";
import { createComparison } from "../controllers/comparison.controller";
import {
  stimuliUpload,
  validateStimuliUploads,
} from "../validators/stimuli.validator";
import multer from "multer";

const router = Router();

// Multer setup for handling file uploads in memory (MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// create study route
router.post(
  "/register/study",
  authenticateUser,
  upload.single("coverImage"),
  createStudyValidator,
  validateRequest,
  createStudy
);


router.get("/study-session/:id", getStudyByIdSession);
router.get("/:id/check-session-exists", checkSessionExists);
router.get("/:id", authenticateUser, getStudyById);

// For public access to participate in study


router.get("/study-session/:id", getStudyByIdSession);

router.get("/:id", authenticateUser, getStudyById);

router.post(
  "/:studyId/comparisons",
  authenticateUser,
  stimuliUpload.array("stimuli"),
  validateStimuliUploads,
  createComparisonValidator,
  validateRequest,
  createComparison
);

router.get("/", authenticateUser, getAllStudies);
router.delete("/:id", authenticateUser, deleteStudyById);

router.patch("/:id/activate", authenticateUser, activateStudy);
router.patch("/:id/deactivate", authenticateUser, deactivateStudy);

export default router;
