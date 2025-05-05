import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otp: string;
  otpExpires: Date;
  isVerified: boolean;
  workspaces: mongoose.Types.ObjectId[];
  refreshToken?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, // Ensures MongoDB generates an _id automatically
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  otp: { type: String },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  workspaces: [
    {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>("User", UserSchema, "users");
