import { body, check, param } from "express-validator";
import { RequestHandler } from "express";

export const createComparisonValidator = [
  // Validate studyId parameter
  param("studyId").isMongoId().withMessage("Invalid study ID format"),

  // Validate required fields
  body("title")
    .notEmpty()
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string"),

  body("type")
    .notEmpty()
    .withMessage("Comparison type is required")
    .isString()
    .withMessage("Type must be a string"),

  // Validate optional fields
];

/* export const updateComparisonValidationRules = [
    // Validate comparisonId parameter
    param('id')
      .isMongoId()
      .withMessage('Invalid comparison ID format'),
    
    // Validate optional fields (only if present)
    body('question')
      .optional()
      .notEmpty()
      .withMessage('Question cannot be empty')
      .isString()
      .withMessage('Question must be a string'),
    
    body('type')
      .optional()
      .notEmpty()
      .withMessage('Type cannot be empty')
      .isString()
      .withMessage('Type must be a string'),
    
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    
    body('instructions')
      .optional()
      .isString()
      .withMessage('Instructions must be a string'),
    
    body('config')
      .optional()
      .isObject()
      .withMessage('Config must be an object')
  ]; */
