import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { Workspace } from "../models/workspace.model";
import { generateOTP } from "../utils/otp.util";
import { Types } from "mongoose";
import dotenv from "dotenv";

const SALT_ROUNDS = 10; //WE must consider moving this to .env file instead for security purposes

//This service is for creating users. The service is used within the controller
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
    return;
  }

  // here we will validate the user using email otp
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() * 10 * 60 * 1000);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  // Create default workspace
  const workspace = new Workspace({
    _id: new Types.ObjectId(),
    name: `${firstName}'s Workspace`,
    owner: newUser._id,
    members: [{ user: newUser._id, role: "owner" }],
  });

  await workspace.save();

  newUser.workspaces.push(workspace._id as Types.ObjectId);
  await newUser.save();

  return { newUser };
};
