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

    res.status(200).json(user); // Send the response directly
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
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
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
};

// Get current user from access token cookie
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // The user object is already attached to the request by the authenticateUser middleware
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return the user data without sensitive information
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      // Add any other non-sensitive fields you want to include
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error retrieving current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
