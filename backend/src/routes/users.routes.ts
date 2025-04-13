import { Router } from "express";
import {
  retrieveUserById,
  createUser,
  retrieveUsers,
  retrieveUserByWorkspace,
  updateUserById,
  getCurrentUser,
} from "../controllers/users.controller";
import {
  registerUserValidator,
  updateUserValidator,
} from "../validators/user.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

// Create User
router.post("/register", registerUserValidator, validateRequest, createUser);

// Get current authenticated user (must come before other routes to avoid being treated as an ID)
router.get("/me", authenticateUser, getCurrentUser);

// Get users by workspace id
router.get("/workspace/:id", validateRequest, retrieveUserByWorkspace);

// Get user by user id
router.get("/:id", authenticateUser, retrieveUserById);

// Update user by user id
router.put("/:id", updateUserValidator, validateRequest, updateUserById);

// Get all users
router.get("/", validateRequest, retrieveUsers);

export default router;
