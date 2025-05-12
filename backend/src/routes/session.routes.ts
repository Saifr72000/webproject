import { Router } from "express";
import {
  createSessionController,
  addResponseController,
  completeSessionController,
  getSessionByIdController,
  findingSessions,
} from "../controllers/session.controller";
import {
  addResponseValidator,
  completeSessionValidator,
  createSessionValidator,
} from "../validators/session.validator";
import { authenticateUser } from "../middlewares/auth.middleware";

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

router.get("/get-session/:sessionId", getSessionByIdController);

router.get("/check-session-exists/:studyId", findingSessions);


export default router;

