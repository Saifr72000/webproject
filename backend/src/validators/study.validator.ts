import { body, param } from "express-validator";
import { RequestHandler } from "express";

export const createStudyValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Study name is required")
    .isString()
    .withMessage("Study name must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Study name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
];
