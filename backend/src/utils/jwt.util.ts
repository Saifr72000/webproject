import jwt from "jsonwebtoken";

/* const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET as string; */

const ACCESS_SECRET = "RrFtLu4a+Nf8AwZ8zkB3lWxl/EIlvqJidD17VRjKFfQ=";
const REFRESH_SECRET = "RrFtLu4a+Nf8AwZ8zkB3lWxl/EIlvqJidD17VRjKFfQ=";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, REFRESH_SECRET);
};
