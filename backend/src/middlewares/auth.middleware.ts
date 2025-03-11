import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.access_token; // ✅ Read from cookies

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return; // ✅ Ensure function exits
    }

    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;

    next(); // ✅ Move to next middleware or route
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return; // ✅ Ensure function exits
  }
};
