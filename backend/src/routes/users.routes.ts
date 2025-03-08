import { Router } from "express";
import {
  getUsers,
  getUsersById,
  createUser,
} from "../controllers/users.controller";
import { registerUserValidator } from "../validators/user.validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";

const router = Router();

router.get("/", getUsers);

router.get("/:id", getUsersById);

// Create User

router.post("/register", registerUserValidator, validateRequest, createUser);

export default router;
