import { Router } from "express";
import {
  retrieveUserById,
  createUser,
  retrieveUsers,
  retrieveUserByWorkspace,
  updateUserById,
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

// Get user by user id
router.get("/:id", authenticateUser, retrieveUserById);

router.post(
  "/updateuser/:id",
  updateUserValidator,
  validateRequest,
  updateUserById
);
// Get all users
router.get("/", validateRequest, retrieveUsers);

//Get users by workspace id
router.get("/workspace/:id", validateRequest, retrieveUserByWorkspace);

export default router;
