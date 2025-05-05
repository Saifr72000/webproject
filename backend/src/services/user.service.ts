import bcrypt from "bcrypt";
import { IUser, User } from "../models/user.model";
import { Workspace } from "../models/workspace.model";
import { generateOTP } from "../utils/otp.util";
import { Types } from "mongoose";

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

  await newUser.save(); // Saves user to db

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

  // Ensure no sensitive information is returned in the API response.
  return {
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    workspaces: newUser.workspaces,
  };
};

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find().select("-password"); // Exclude password for security
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId).select("-password");
};

export const getUsersByWorkspace = async ( // This function retrieves all users in a specific workspace
  workspaceId: string
): Promise<IUser[]> => {
  return await User.find({ workspaces: workspaceId }).select("-password");
};

export const updateUser = async (
  userId: string,
  updates: Partial<Pick<IUser, "firstName" | "lastName" | "password">>
): Promise<IUser | null> => {
  try {
    const { firstName, lastName, password } = updates;

    const updateData: Partial<IUser> = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updateData.password = hashedPassword;
    }

    const updateUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");
    return updateUser;
  } catch (error) {
    throw new Error("Failed to update user");
  }
};
