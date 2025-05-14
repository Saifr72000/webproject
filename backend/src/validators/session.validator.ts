import { body, param } from "express-validator";

export const createSessionValidator = [
  body("studyId").isMongoId().withMessage("Invalid study ID format").trim(),
];

export const addResponseValidator = [
  param("sessionId")
    .isMongoId()
    .withMessage("Invalid session ID format")
    .trim(),
  body("comparisonId")
    .isMongoId()
    .withMessage("Invalid comparison ID format")
    .trim(),

  // We'll validate the specific structure in the controller/service
  // based on the comparison type
  body("responseData").exists().withMessage("Response data is required"),

  // For the controller to determine which validation to apply
  body("comparisonType")
    .isIn(["rating", "single-select", "binary", "multi-select"])
    .withMessage("Invalid comparison type")
    .trim(),
];

export const completeSessionValidator = [
  param("sessionId")
    .isMongoId()
    .withMessage("Invalid session ID format")
    .trim(),

  // can add more specific validation the respective fields within demographics object
  body("demographicsData")
    .isObject()
    .withMessage("Demographics data must be an object"),

  body("isComplete")
    .exists()
    .withMessage("isComplete field is required")
    .isBoolean()
    .withMessage("isComplete must be a boolean value")
    .equals("true")
    .withMessage("isComplete must be true when completing a session"),
];
