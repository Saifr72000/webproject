import { IWorkspace, Workspace } from "../models/workspace.model";
import { User } from "../models/user.model";
import { Types } from "mongoose";

// Create a workspace
export const createWorkspace = async (name: string, ownerId: string): Promise<IWorkspace> => {

const owner = await User.findById(ownerId);

if (!owner) throw new Error("Owner not found");

// workspace object is created using the Workspace model from workspace.model.ts
const workspace = new Workspace({
    name,
    owner: ownerId,
    members: [{ user: ownerId, role: "owner" }],
    studies: [],
});

await workspace.save();
return workspace;
};

// Get all workspaces
export const getUserWorkspaces = async (userId: string): Promise<IWorkspace[]> => {
    return await Workspace.find({ "members.user": userId })
    .populate("studies");
};

// Get workspace by ID
export const getWorkspaceById = async (workspaceId: string, userId: string): Promise<IWorkspace | null> => {
    return await Workspace.findOne({ _id: workspaceId, "members.user": userId })
    .populate("studies");
};
  
