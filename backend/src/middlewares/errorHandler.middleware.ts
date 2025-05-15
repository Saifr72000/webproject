import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "File too large. Max size is 10MB." });
    return;
  }

  if (err.message && err.message.startsWith("File type not allowed")) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong." });
}
