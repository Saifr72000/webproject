import express from "express";
import { Router } from "express";
import { body } from "express-validator";
import { createComparison } from "../controllers/comparison.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";

import { authenticateUser } from "../middlewares/auth.middleware";
import { deleteComparisonById } from "../controllers/comparison.controller";

const router = Router();

router.post(
  "/:studyId",
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("prompt").isString().notEmpty().withMessage("Prompt is required"),
    body("type")
      .isIn(["rating", "single-select", "binary", "multi-select"])
      .withMessage("Invalid comparison type"),
    body("stimuliType")
      .isIn(["image", "video", "audio", "pdf"])
      .withMessage("Invalid stimuli type"),
    body("order").isInt({ min: 0 }).withMessage("Order must be a non-negative integer"),
    body("options").isArray({ min: 2 }).withMessage("At least 2 stimuli are required"),
    body("options.*.stimulus")
      .isString()
      .notEmpty()
      .withMessage("Each option must include a stimulus ID"),
    body("options.*.label")
      .optional()
      .isString()
      .withMessage("Label must be a string"),
    body("config").optional().isObject(),
    body("required").optional().isBoolean(),
    validateRequest,
  ],
  createComparison
);

router.delete("/:id", authenticateUser, deleteComparisonById);

export default router;
