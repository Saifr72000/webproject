import mongoose, { Schema, Document, Types } from "mongoose";
import { IStimulus } from "./stimuli.model";
import { IStudy } from "./study.model";

// Define valid comparison types
export type ComparisonType =
  | "rating"
  | "single-select"
  | "binary"
  | "multi-select";

// Define valid stimuli types
export type StimuliType = "image" | "video" | "audio" | "pdf";

// Interface for an option within a comparison
export interface IComparisonOption {
  stimulus: Types.ObjectId | IStimulus;
  label?: string;
}

// Main comparison interface
export interface IComparison extends Document {
  study: Types.ObjectId | IStudy;
  title: string;
  prompt: string;
  type: ComparisonType;
  stimuliType: StimuliType;
  order: number;
  options: IComparisonOption[];
  required: boolean;
  config: Record<string, any>;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    study: {
      type: Schema.Types.ObjectId,
      ref: "Study",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["rating", "single-select", "binary", "multi-select"],
      required: true,
    },
    stimuliType: {
      type: String,
      enum: ["image", "video", "audio", "pdf"],
      required: true,
    },
    options: [
      {
        stimulus: {
          type: Schema.Types.ObjectId,
          ref: "Stimulus",
          required: true,
        },
        label: {
          type: String,
        },
      },
    ],
    required:{
      type: Boolean,
      default: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    }
  },
  { timestamps: true }
);


 ComparisonSchema.index({ study: 1, order: 1 }), { unique: true };

export const Comparison = mongoose.model<IComparison>(
  "Comparison",
  ComparisonSchema
);
