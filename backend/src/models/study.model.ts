import mongoose, { Schema, Document } from "mongoose";

export type StudyStatus = "draft" | "active" | "completed";

export interface IStudy extends Document {
  _id: mongoose.Types.ObjectId;
  coverImage: mongoose.Types.ObjectId;
  comparisons: mongoose.Types.ObjectId[];
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: StudyStatus;
  participantCount: number;
  responseCount: number;
}

const StudySchema = new Schema<IStudy>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stimulus",
    },
    comparisons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comparison",
      },
    ],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "active",
    },
    participantCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* StudySchema.set("toJSON", { virtuals: true });
StudySchema.set("toObject", { virtuals: true }); */

// Indexes for faster queries
StudySchema.index({ owner: 1 });
StudySchema.index({ workspace: 1 });
StudySchema.index({ status: 1 });

export const Study = mongoose.model<IStudy>("Study", StudySchema);
