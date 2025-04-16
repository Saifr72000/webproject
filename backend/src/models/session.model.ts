import mongoose, { Schema, Document } from "mongoose";

export interface IResponse {
  comparison: mongoose.Types.ObjectId;
  data: any; // Flexible structure based on comparison type
  createdAt: Date;
}

export interface ISession extends Document {
  study: mongoose.Types.ObjectId;
  startedAt: Date;
  completedAt?: Date;
  demographics?: Record<string, string>; // Stores demographic responses
  responses: IResponse[];
  progress: number; // 0-100 percentage of completion
  userAgent?: string;
  referrer?: string;
  duration?: number; // Total time in seconds

  _previousResponsesCount?: number;
}

const ResponseSchema = new Schema({
  comparison: {
    type: Schema.Types.ObjectId,
    ref: "Comparison",
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SessionSchema = new Schema<ISession>({
  study: {
    type: Schema.Types.ObjectId,
    ref: "Study",
    required: true,
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  demographics: {
    type: Schema.Types.Mixed,
    default: {},
  },
  responses: [ResponseSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  userAgent: {
    type: String,
  },
  referrer: {
    type: String,
  },
  duration: {
    type: Number,
  },
});

// Calculate duration when session is completed
SessionSchema.pre("save", function (next) {
  if (this.isModified("completedAt") && this.completedAt && this.startedAt) {
    this.duration = Math.round(
      (this.completedAt.getTime() - this.startedAt.getTime()) / 1000
    );
  }
  next();
});

// Update study participant count when a new session is created
SessionSchema.post("save", async function () {
  if (this.isNew) {
    await mongoose.model("Study").findByIdAndUpdate(this.study, {
      $inc: { participantCount: 1 },
    });
  }
});

// Store previous responses count for the pre-save hook
SessionSchema.pre("save", function (next) {
  if (this.isModified("responses")) {
    this._previousResponsesCount = this.responses.length;
  }
  next();
});

// Update study response count when responses are added
SessionSchema.pre("save", async function (next) {
  if (this.isModified("responses")) {
    const previousCount = this._previousResponsesCount || 0;
    const newResponsesCount = this.responses.length - previousCount;

    if (newResponsesCount > 0) {
      await mongoose.model("Study").findByIdAndUpdate(this.study, {
        $inc: { responseCount: newResponsesCount },
      });
    }
  }
  next();
});

// Indexes for faster queries
SessionSchema.index({ study: 1, completedAt: 1 });
SessionSchema.index({ startedAt: 1 });
SessionSchema.index({ progress: 1 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
