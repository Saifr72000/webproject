import { Request, Response, NextFunction } from "express-serve-static-core";
import { User } from "../models/user.model";
import { loginUser } from "../services/auth.service";
import { generateAccessToken, verifyRefreshToken } from "../utils/jwt.util";

interface LoginRequestBody {
  email: string;
  password: string;
  refreshToken: string;
}

export const loginController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Login controller called from FF");
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password, res); // Pass `res` to set cookies

    if (!result) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error); // Forward error to Express error handler
  }
};

export const refreshTokenController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) {
      res.status(401).json({ message: "Refresh Token Required" });
      return;
    }

    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      res.status(403).json({ message: "Invalid Refresh Token" });
      return;
    }
    const refreshToken = refresh_token; // referring to user model key for storing refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(403).json({ message: "Refresh Token Not Found" });
      return;
    }

    const newAccessToken = generateAccessToken(user._id.toString());

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    res.status(403).json({ message: "Invalid Refresh Token" });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
