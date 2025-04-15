import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Allowed file types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "audio/mpeg",
  "audio/wav",
  // Add other allowed types as needed
];

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Multer file filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(
      new Error(
        `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
      )
    );
  }
};

// Configure multer
export const stimuliUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum number of files
  },
  fileFilter,
});

// Post-upload validation middleware
export const validateStimuliUploads = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const files = req.files as Express.Multer.File[];

  // Check if files exist
  if (!files || files.length === 0) {
    res.status(400).json({
      message: "Validation failed",
      errors: [
        { msg: "At least one stimulus file is required", param: "files" },
      ],
    });
    return;
  }

  // If all validation passes
  next();
};
