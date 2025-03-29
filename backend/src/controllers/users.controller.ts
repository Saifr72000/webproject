import { Request, Response } from "express-serve-static-core";
import {
  getAllUsers,
  registerUser,
  getUserById,
  getUsersByWorkspace,
  updateUser,
} from "../services/user.service";
import { User } from "../models/user.model";

export const createUser = async (request: Request, response: Response) => {
  try {
    const { firstName, lastName, email, password } = request.body;
    const user = await registerUser(firstName, lastName, email, password);

    response.status(201).json({
      message: "User registered successfully. Check your email for OTP",
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message });
    } else {
      response.status(400).json({ message: "An unknwn error occurred" });
    }
  }
};

export const retrieveUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// Retrieve user by user id controller
export const retrieveUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserById(req.params.id); // Fetch user from DB

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user); // ✅ Send the response directly
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve user by workspace id controller
export const retrieveUserByWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsersByWorkspace(req.params.id);
    console.log(req);

    if (users.length === 0) {
      res.status(404).json({ message: "No users found in this workspace" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

//Update user by user id controller

export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, password } = req.body;
    const updatedUser = await updateUser(id, { firstName, lastName, password });
    console.log(req);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

 // clean up the response
    const userObject = updatedUser.toObject();
    delete userObject.__v;
    userObject.id = userObject._id;
    delete userObject._id;

    res.status(200)
      .json({ message: "User updated successfully", user: userObject });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
};
