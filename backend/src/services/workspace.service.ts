import { Workspace } from "../models/workspace.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { IWorkspace } from "../models/workspace.model";

interface CreateWorkspaceOptions {
  name: string;
  userId: mongoose.Types.ObjectId;
}

export const createWorkspaceService = async ({ name, userId }: CreateWorkspaceOptions) => {
  // Create workspace instance
  const workspace = new Workspace({
    name,
    owner: userId,
    members: [{ user: userId, role: "owner" }],
  });

  // Save the workspace to the database
  await workspace.save();

  // Link workspace to the user
  await User.findByIdAndUpdate(userId, {
    $push: { workspaces: workspace._id },
  });
  return workspace;
};


export const getWorkspaceForUser = async (userId: mongoose.Types.ObjectId) => {
    // return all workspaces where user is a member
        return Workspace.find({
          "members.user": userId,
        });
      };


      export const getWorkspaceByIdService = async (
        workspaceId: string
      ): Promise<(Document & IWorkspace) | null> => {
        return Workspace.findById(workspaceId);
      };

      export const deleteWorkspaceById = async (
        workspaceId: string,
        userId: mongoose.Types.ObjectId
    ): Promise<true | "forbidden" | null> => {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return null;
        }

        if (!workspace.owner.equals(userId)) {
            return "forbidden";
        }

        await workspace.deleteOne();

        return true;
      };

export const updateWorkspaceById = async (
  workspaceId: string,
  userId: mongoose.Types.ObjectId,
  updates: { name?: string }
): Promise<IWorkspace | "forbidden" | null> => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;

  const isOwner = workspace.owner.equals(userId);
  if (!isOwner) return "forbidden";

  if (updates.name) {
    workspace.name = updates.name;
  }

  await workspace.save();
  return workspace;
};


export const addUserToWorkspace = async (
    workspaceId: string,
    ownerId: mongoose.Types.ObjectId,
    newUserId: mongoose.Types.ObjectId
  ): Promise<IWorkspace | "forbidden" | "already-member" | null> => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return null;
  
    const isOwner = workspace.owner.equals(ownerId);
    if (!isOwner) return "forbidden";
  
    const alreadyMember = workspace.members.some(member =>
      member.user.equals(newUserId)
    );
    if (alreadyMember) return "already-member";
  
    workspace.members.push({ user: newUserId, role: "member" });
    await workspace.save();
  
    return workspace;
  };
  




