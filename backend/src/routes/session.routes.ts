import { Router } from "express";
import {
  createSessionController,
  addResponseController,
  completeSessionController,
  getSessionByIdController,
} from "../controllers/session.controller";
import {
  addResponseValidator,
  completeSessionValidator,
  createSessionValidator,
} from "../validators/session.validator";

const router = Router();

router.post(
  "/create-session/:studyId",
  createSessionValidator,
  createSessionController
);
router.post(
  "/add-response/:sessionId",
  addResponseValidator,
  addResponseController
);
router.post(
  "/complete-session/:sessionId",
  completeSessionValidator,
  completeSessionController
);
export default router;
