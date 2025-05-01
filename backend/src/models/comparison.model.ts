import mongoose, { Schema, Document } from "mongoose";

export type ComparisonType = "scale" | "order" | "binary" | "multi-select";

export interface IComparison extends Document {
  question: string; // The main question text shown to participants
  instructions?: string; // Optional additional instructions/context
  type: ComparisonType;
  study: mongoose.Types.ObjectId;
  stimuli: mongoose.Types.ObjectId[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
  // Type-specific configuration
config?: {
    // For select-multiple: minimum and maximum selections
    minSelections?: number;
    maxSelections?: number;
    // For ranking: whether partial rankings are allowed
    allowPartialRanking?: boolean;
    // Any other type-specific configuration
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: string[];
    binaryLabels?: [string, string];
  };
}

const ComparisonSchema: Schema<IComparison> = new Schema({ question: {   type: String,  required: true, },
  instructions: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ["scale", "order", "binary", "multi-select"],
    required: true,
  },
  study: {
    type: Schema.Types.ObjectId,
    ref: "Study",
    required: true,
  },
  stimuli: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stimulus",
    },
  ],
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  config: {
    minSelections: { type: Number, min: 1 },
    maxSelections: { type: Number },
    allowPartialRanking: { type: Boolean, default: false },
    scaleLabels: [String],
    binaryLabels: [String],
  },
});

// Update the updatedAt field on save
ComparisonSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Validate that maxSelections is greater than or equal to minSelections
ComparisonSchema.path("config.maxSelections").validate(function (value) {
  if (this.config && this.config.minSelections && value) {
    return value >= this.config.minSelections;
  }
  return true;
}, "Maximum selections must be greater than or equal to minimum selections");

ComparisonSchema.index({ study: 1, order: 1 });

export const Comparison = mongoose.model<IComparison>(
  "Comparison",
  ComparisonSchema
);
