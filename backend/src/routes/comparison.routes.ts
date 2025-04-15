import { Router } from "express";
import { createComparison } from "../controllers/comparison.controller";
import { createComparisonValidator } from "../validators/comparison.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();
