import { body, check } from "express-validator";
import { RequestHandler } from "express";

// For validating input and sanization
export const registerUserValidator: RequestHandler[] = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First Name is required")
    .isAlpha()
    .withMessage("First Name must contain only letters")
    .escape()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"), //This can be removed actually

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha()
    .withMessage("Last name must contain only letters")
    .escape()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 char"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at leasr 6 characters long"),
];

export const updateUserValidator = [
  check("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string"),
  check("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),
  check("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must at least be 6 characters long"),
];
