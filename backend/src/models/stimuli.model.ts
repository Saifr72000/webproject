import mongoose, { Schema, Document } from "mongoose";

export interface IStimulus extends Document {
  name: string;
  originalFilename: string;
  fileUrl: string;
  mimetype: string;
  size: number;
  createdAt: Date;
}

const StimulusSchema = new Schema<IStimulus>({
  name: {
    type: String,
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  fileUrl: {
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
    validate: {
      validator: function (value: number) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        return value <= MAX_FILE_SIZE;
      },
      message: "File size must be less than 10MB",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
StimulusSchema.index({ name: 1 }); // Indexing the name field for faster lookups

export const Stimulus = mongoose.model<IStimulus>("Stimulus", StimulusSchema);
