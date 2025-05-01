// middlewares/parseConfig.middleware.ts
import { Request, Response, NextFunction } from "express";

export const parseConfigIfNeeded = (req: Request, res: Response, next: NextFunction): void => {
  if (typeof req.body.config === "string") {
    try {
      req.body.config = JSON.parse(req.body.config);
    } catch (e) {
      res.status(400).json({
        message: "Invalid JSON in config field",
        error: e instanceof Error ? e.message : String(e),
      });
      return; // ✅ Exit function after sending response
    }
  }
  next();
};
