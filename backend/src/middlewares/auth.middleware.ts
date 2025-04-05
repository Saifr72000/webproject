import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";


/**
 * Middleware to authenticate user using JWT access token.
 * The token is expected to be in the cookies of the request.
 * If the token is valid, it attaches the user information to the request object.
 * Otherwise, it sends a 401 Unauthorized response.
 *
*/

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.access_token; // Read from cookies

    if (!token) {
      console.log("🧪 req.cookies:", req.cookies);
      res.status(401).json({ message: "Unauthorized" });
      return; // Ensure function exits
    }

    const decoded = verifyAccessToken(token); // ✅ Verify token
    console.log("Decoded token:", decoded);
    (req as any).user = decoded; // Attach user info to request object (so req.user can be used in subsequent middleware or route handlers)

    next(); // Move to next middleware or route
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return; // Ensure function exits
  }
};
