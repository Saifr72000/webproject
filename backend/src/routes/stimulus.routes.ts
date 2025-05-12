import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getStimulusByIdController } from "../controllers/stimulus.controller";

const router = Router();

const storage = multer.memoryStorage();

router.get("/:id", getStimulusByIdController);

export default router;