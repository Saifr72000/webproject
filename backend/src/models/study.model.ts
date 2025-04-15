import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export type StudyStatus = "draft" | "active" | "completed";

export interface DemographicOption {
  value: string;
  label: string;
}

export interface DemographicField {
  id: string;
  label: string;
  required: boolean;
  options: DemographicOption[];
}

export interface IStudy extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: StudyStatus;
  publicUrl: string;
  createdAt: Date;
  updatedAt: Date;
  participantCount: number;
  responseCount: number;
  demographics: {
    enabled: boolean;
    fields: DemographicField[];
  };
}

const DemographicOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const DemographicFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [DemographicOptionSchema],
  },
  { _id: false }
);

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
  status: {
    type: String,
    enum: ["draft", "active", "completed"],
    default: "draft",
  },
  publicUrl: {
    type: String,
    default: () => crypto.randomBytes(6).toString("base64url"),
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now },
  participantCount: {
    type: Number,
    default: 0,
  },
  responseCount: {
    type: Number,
    default: 0,
  },
  demographics: {
    enabled: { type: Boolean, default: true },
    fields: {
      type: [DemographicFieldSchema],
      default: function () {
        return [
          {
            id: "age",
            label: "Age",
            required: true,
            options: [
              { value: "18-24", label: "18-24" },
              { value: "25-34", label: "25-34" },
              { value: "35-44", label: "35-44" },
              { value: "45-54", label: "45-54" },
              { value: "55-64", label: "55-64" },
              { value: "65+", label: "65+" },
            ],
          },
          {
            id: "gender",
            label: "Gender",
            required: true,
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "non-binary", label: "Non-binary" },
              { value: "prefer-not-to-say", label: "Prefer not to say" },
            ],
          },
          {
            id: "country",
            label: "Country",
            required: true,
            options: [
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
              { value: "uk", label: "United Kingdom" },
              { value: "au", label: "Australia" },
              { value: "de", label: "Germany" },
              { value: "fr", label: "France" },
              { value: "jp", label: "Japan" },
              { value: "cn", label: "China" },
              { value: "in", label: "India" },
              { value: "br", label: "Brazil" },
              { value: "other", label: "Other" },
            ],
          },
        ];
      },
    },
  },
});

StudySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

//This can be removed for MVP basically
/* StudySchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if publicUrl already exists
    const existingStudy = await mongoose.models.Study.findOne({ publicUrl: this.publicUrl });
    if (existingStudy) {
      // Generate a new one if collision detected
      this.publicUrl = crypto.randomBytes(6).toString('base64url');
    }
  }
  next();
});
 */
StudySchema.virtual("comparisons", {
  ref: "Comparison",
  localField: "_id",
  foreignField: "study",
});

StudySchema.set("toJSON", { virtuals: true });
StudySchema.set("toObject", { virtuals: true });

// Indexes for faster queries
StudySchema.index({ owner: 1 });
StudySchema.index({ workspace: 1 });
StudySchema.index({ status: 1 });

export const Study = mongoose.model<IStudy>("Study", StudySchema);
