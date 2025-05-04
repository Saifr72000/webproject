import mongoose, { Schema, Document } from "mongoose";

export interface IStimulus extends Document {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  type: string;
  mimetype: string;
  size: number;
  data: Buffer;
  url: string;
  comparison: mongoose.Types.ObjectId | string;
}

const StimulusSchema = new Schema<IStimulus>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
    comparison: {
      type: Schema.Types.ObjectId,
      ref: "Comparison",
    },
  },
  { timestamps: true }
);

// Indexing the name field for faster lookups

export const Stimulus = mongoose.model<IStimulus>("Stimulus", StimulusSchema);
