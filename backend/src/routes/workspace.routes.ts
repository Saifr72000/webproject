import { Router } from "express";
import {
  createWorkspace,
} from "../controllers/workspace.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser, createWorkspace);

export default router;

