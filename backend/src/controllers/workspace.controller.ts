import { Request, Response } from "express";
import { saveNewWorkspace,
     getWorkspaceForUser, 
     fetchWorkspaceId,
     deleteWorkspaceById,
     addUserToWorkspace,
     updateWorkspaceById

} from "../services/workspace.service";
import mongoose from "mongoose";
import { Workspace } from "../models/workspace.model";
import { IWorkspace } from "../models/workspace.model";
import { ObjectId } from "bson";


// This controller is for creating workspaces. The controller is used within the routes
export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId; // firstly authenticateUser middleware added a user property to req: (req as any).user = decoded;

    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId.toString())) { // is the userId a valid MongoDB ObjectId?
      res.status(401).json({ message: "Invalid or missing user ID." });
      return;
    }

    // call function to create workspace
    const workspace = await saveNewWorkspace({ // calling the service function and passing name and userId to it
        name,
        userId: mongoose.Types.ObjectId.createFromHexString(userId.toString()) // Converts userId string to ObjectId so that MongoDB can use it
      });
      

    // return response to the client
    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// This controller is for retrieving workspaces the user is a member of
export const getUserWorkspaces = async (req : Request, res: Response): Promise <void> => {
    try {
        const userId = req.user?.userId;
 // Get user ID from request

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // find all workspaces where user is a member
        const workspaces = await getWorkspaceForUser(userId); // Fetch workspaces from DB

         res.status(200).json(workspaces);
    } catch (error) {
        console.error("Error retrieving workspaces:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// This controller is for retrieving a workspace by its IDW

export const getWorkspaceById = async (req: Request, res: Response): Promise<void> => { 
    try {
      const workspaceId = req.params.id; // Extract workspace ID from request parameters from the URL
  
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        res.status(400).json({ message: "Invalid workspace ID" });
        return;
      }
  
      //Call the service to fetch workspace
      const workspace: IWorkspace | null = await fetchWorkspaceId(workspaceId); // valid workspace or null
  
      //Handle not found
      if (!workspace) {
        res.status(404).json({ message: "Workspace not found" });
        return;
      }
  
      // Return the result
      res.status(200).json({workspace});
    } catch (error) {
      console.error("Error retrieving workspace:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // delete workspace by ID
  export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
          const WorkspaceId = req.params.id; // Extract workspace ID from request parameters or the URL
          const userId = req.user?.userId; // Extract user ID from request object (set by auth middleware)
;

        if (!userId){
            res.status(401).json({message: "Unauthorized"});
            return;
        }
        
        if (!mongoose.Types.ObjectId.isValid(WorkspaceId)){
            res.status(400).json({ message: "Invalid Workspace ID"});
            return;
        }

        const result = await deleteWorkspaceById(WorkspaceId, userId);

        if (result === "forbidden") {
            res.status(403).json({message: "only owner can delete this workspace"})
            return;
        }
        if (!result){
            res.status(404).json({ message: "workspace not found"});
            return;
        }

        res.status(200).json({ message: "workspace deleted successfully"});
    } catch (error) {
        console.error("Error retrieving workspace:", error);
        res.status(500).json({ message: "internal sever error"});
    };
  };



    // update workspace name, (checks if its the owner)
export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.userId;
;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const result = await updateWorkspaceById(workspaceId, userId, { name });

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



export const addUserToWorkspaceController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract IDs from request parameters and body
    const workspaceId = req.params.id;
    const ownerId = req.user?.userId;
    const { userId } = req.body;

    // Validate presence of required IDs
    if (!ownerId || !userId) {
      res.status(400).json({ message: "Missing user ID" });
      return;
    }

    // Validate MongoDB ObjectId format for both workspace and user
    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    // Call service logic to add the user to the workspace (after service function)
    const result = await addUserToWorkspace(workspaceId, ownerId,
         new mongoose.Types.ObjectId(userId as string));

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


