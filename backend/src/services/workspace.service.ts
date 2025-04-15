import { Workspace } from "../models/workspace.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { IWorkspace } from "../models/workspace.model";

// typescript interface that says: " Any object passed to saveNewWorkspace() must have a name (string) and a userId (ObjectId)"
interface CreateWorkspaceOptions { 
  name: string; // name of the workspace
  userId: mongoose.Types.ObjectId; // userId of the owner of the workspace
}

// Function to create a new workspace
// This function is used to create a new workspace and link it to the user
export const saveNewWorkspace = async ({ name, userId }: CreateWorkspaceOptions) => { // name and userId are required
  // Create workspace instance
  const workspace = new Workspace({
    name, 
    owner: userId, // Set the owner of the workspace to the userId passed in
    members: [{ user: userId, role: "owner" }], // Add the user as a member with the role of owner
  });

  // Save the workspace to the database
  await workspace.save(); // Save the workspace to the database and gives it an ID

  // Link workspace to the user
  await User.findByIdAndUpdate(userId, {
    $push: { workspaces: workspace._id },
  }); // Find the user with this userId, and push the new workspace’s ID into their workspaces array.
  return workspace;
};


export const getWorkspaceForUser = async (userId: mongoose.Types.ObjectId) => {
    // return all workspaces where user is a member
        return Workspace.find({
          "members.user": userId,
        });
      };


      export const fetchWorkspaceId = async (
        workspaceId: string
      ): Promise<(Document & IWorkspace) | null> => { // promise to return workspace or null
        return Workspace.findById(workspaceId);
      };

      export const deleteWorkspaceById = async (
        workspaceId: string,
        userId: mongoose.Types.ObjectId
    ): Promise<true | "forbidden" | null> => { // promise to return true or "forbidden" or null
        const workspace = await Workspace.findById(workspaceId); // Find workspace by ID

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
  const workspace = await Workspace.findById(workspaceId);// finds the whole workspace document that includes the name, owner, members, studies, and createdAt fields
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
    workspaceId: string, // ID of the workspace to which the user is being added
    ownerId: mongoose.Types.ObjectId, // the ownerId must be a mongoose ObjectId and not just a string
    newUserId: mongoose.Types.ObjectId
  ): Promise<IWorkspace | "forbidden" | "already-member" | null> => { // promise to return workspace or "forbidden" or "already-member" or null
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
  




