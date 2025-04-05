import { Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";

export const loginUser = async (
  email: string,
  password: string,
  res: Response
) => {
  const user = await User.findOne({ email });

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // Set access token in HTTP-only, secure cookies
  res.cookie("access_token", accessToken, {
    httpOnly: true, // Prevents JavaScript access (protects against XSS)
    secure: true, // Ensures cookie is only sent over HTTPS
    sameSite: "strict", // Protects against CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes expiration
  });

  // Set refresh token in HTTP-only cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  });

  return {
    message: "Login successful",
    user: { id: user._id, email: user.email },
  };
};
