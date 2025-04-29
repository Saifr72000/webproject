import { Request, Response } from "express";
import {
  saveNewWorkspace,
  getWorkspaceForUser,
  fetchWorkspaceId,
  deleteWorkspaceById,
  addUserToWorkspace,
  updateWorkspaceById
} from "../services/workspace.service";
import mongoose from "mongoose";
import { Workspace, IWorkspace } from "../models/workspace.model";
import {  } from "bson";

// Create Workspac
export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId.toString())) {
      res.status(401).json({ message: "Invalid or missing user ID." });
      return;
    }

    const workspace = await saveNewWorkspace({
      name,
      userId: mongoose.Types.ObjectId.createFromHexString(userId.toString())
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Workspaces
export const getUserWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const workspaces = await getWorkspaceForUser(new mongoose.Types.ObjectId(userId as string));
    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error retrieving workspaces:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Workspace by ID
export const getWorkspaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const workspace: IWorkspace | null = await fetchWorkspaceId(workspaceId);

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.status(200).json({ workspace });
  } catch (error) {
    console.error("Error retrieving workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Workspace
export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid Workspace ID" });
      return;
    }

    const result = await deleteWorkspaceById(workspaceId, userId);

    if (result === "forbidden") {
      res.status(403).json({ message: "only owner can delete this workspace" });
      return;
    }
    if (!result) {
      res.status(404).json({ message: "workspace not found" });
      return;
    }

    res.status(200).json({ message: "workspace deleted successfully" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

// Update Workspace
export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const result = await updateWorkspaceById(
      workspaceId,
      new mongoose.Types.ObjectId(userId as string),
      { name }
    );

    if (result === "forbidden") {
      res.status(403).json({ message: "Only the owner can update this workspace" });
      return;
    }

    if (!result) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.status(200).json({ message: "Workspace updated", workspace: result });
  } catch (error) {
    console.error("Failed to update workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add User to Workspace
export const addUserToWorkspaceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = req.params.id;
    const ownerId = req.user?.userId;
    const { userId } = req.body;

    if (!ownerId || !userId) {
      res.status(400).json({ message: "Missing user ID" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const result = await addUserToWorkspace(workspaceId, ownerId, new mongoose.Types.ObjectId(userId as string));

    if (result === "forbidden") {
      res.status(403).json({ message: "Only the owner can add users" });
      return;
    }

    if (result === "already-member") {
      res.status(409).json({ message: "User is already a member" });
      return;
    }

    if (!result) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.status(200).json({ message: "User added to workspace", workspace: result });
  } catch (error) {
    console.error("Failed to add user to workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
