import { Router } from "express";
import {
  createWorkspace,
  getWorkspaceById,
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  addUserToWorkspaceController
} from "../controllers/workspace.controller";
import { authenticateUser } from "../middlewares/auth.middleware";


// router sees the request and response objects and passes them to the controller function
const router = Router();

router.post("/", authenticateUser, createWorkspace);

router.get("/", authenticateUser, getUserWorkspaces); // Get all workspaces for the authenticated user

router.get("/:id", authenticateUser, getWorkspaceById);

router.patch("/:id", authenticateUser, updateWorkspace);

router.delete("/:id", authenticateUser, deleteWorkspace);

// invite user to workspace
router.post("/:id/users", authenticateUser, addUserToWorkspaceController);



export default router;

