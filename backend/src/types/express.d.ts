import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        // Add any other properties that might be in your JWT payload
      };
    }
  }
}
