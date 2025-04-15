import mongoose, { Schema, Document } from "mongoose";

export interface IStimulus extends Document {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  type: string;
  mimetype: string;
  size: number;
  data: Buffer;
  url: string;
  createdAt: Date;
}

const StimulusSchema = new Schema<IStimulus>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StimulusSchema.pre("save", function (next) {
  if (this.isNew && !this.url) {
    // Set the URL using the document's ID
    this.url = `/api/stimuli/${this._id}`;
  }
  next();
});

StimulusSchema.index({ name: 1 }); // Indexing the name field for faster lookups

export const Stimulus = mongoose.model<IStimulus>("Stimulus", StimulusSchema);
