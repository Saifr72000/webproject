import mongoose, { Schema, Document } from "mongoose";

export interface IStudy extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StudySchema = new Schema<IStudy>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Study = mongoose.model<IStudy>("Study", StudySchema);
