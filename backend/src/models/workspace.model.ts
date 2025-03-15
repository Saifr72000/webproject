import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: { user: mongoose.Types.ObjectId; role: "owner" | "member" }[];
  studies: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>({
  name: {
    type: String,
    required: true,
  },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["owner", "member"], default: "member" },
    },
  ],
  studies: [{ type: Schema.Types.ObjectId, ref: "Studies" }],
  createdAt: { type: Date, default: Date.now },
});

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  WorkspaceSchema
);
