import { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Explicitly return to ensure the function exits
  }

  next(); // Explicitly return void
};
