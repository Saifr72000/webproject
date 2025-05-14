import mongoose, { Schema, Document, Types } from "mongoose";
import { IStudy } from "./study.model";
import { IComparison, ComparisonType } from "./comparison.model";

// Base response interface
interface IBaseResponse {
  comparison: Types.ObjectId;
  comparisonTitle: string;
}

// Rating response (for rating comparison type)
interface IRatingResponse extends IBaseResponse {
  ratingResponses: Array<{
    stimulus: Types.ObjectId;
    rating: number;
  }>;
}

// Single select response (for single-select comparison type)
interface ISingleSelectResponse extends IBaseResponse {
  singleSelectResponses: Types.ObjectId;
}

// Binary response (for binary comparison type)
interface IBinaryResponse extends IBaseResponse {
  binaryResponses: Array<{
    stimulus: Types.ObjectId;
    selected: boolean;
  }>;
}

// Multi-select response (for multi-select comparison type)
interface IMultiSelectResponse extends IBaseResponse {
  multiSelectResponses: Types.ObjectId[];
}

// Union type for all response types, it can either one of Interfaces defined above
type ResponseType =
  | IRatingResponse
  | ISingleSelectResponse
  | IBinaryResponse
  | IMultiSelectResponse;

export interface ISession extends Document {
  study: Types.ObjectId | IStudy;
  currentComparisonIndex: number;
  startedAt: Date;
  completedAt?: Date;
  isComplete: boolean;
  endTime: Date;

  // Demographic data
  demographics?: {
    age?: string;
    gender?: string;
    educationLevel?: string;
    deviceType?: string;
  };

  // User agent for analytics
  userAgent?: string;

  // Responses to comparisons
  responses: ResponseType[];
}

const SessionSchema = new Schema<ISession>(
  {
    study: {
      type: Schema.Types.ObjectId,
      ref: "Study",
      required: true,
    },
    currentComparisonIndex: {
      type: Number,
      default: 0,
    },
    // this might be redundant as we use timestamps true, but good to keep it for future flexibility
    startedAt: {
      type: Date,
      default: Date.now,
    },
    // this might be redundant as we use timestamps true, but good to keep it for future flexibility
    endTime: {
      type: Date,
      default: null,
    },
    completedAt: Date,
    isComplete: {
      type: Boolean,
      default: false,
    },
    demographics: {
      age: String,
      gender: String,
      educationLevel: String,
      deviceType: String,
    },
    userAgent: String,
    responses: [
      {
        // Common fields for all response types
        comparison: {
          type: Schema.Types.ObjectId,
          ref: "Comparison",
          required: true,
        },

        comparisonTitle: {
          type: String,
          required: true,
        },

        submittedAt: {
          type: Date,
          default: Date.now,
        },

        // Fields for rating/scale type
        ratingResponses: [
          {
            stimulus: {
              type: Schema.Types.ObjectId,
              ref: "Stimulus",
            },
            rating: Number,
          },
        ],

        // Field for binary type
        // We can also have  acase where the comparison wants to present multiple stimuluses and ask for a yes or no response,
        // but currently we are only supporting one stimulus to be passed
        binaryResponses: [
          {
            stimulus: {
              type: Schema.Types.ObjectId,
              ref: "Stimulus",
            },
            selected: Boolean,
          },
        ],

        // Field for multi-select type
        multiSelectResponses: [
          {
            type: Schema.Types.ObjectId,
            ref: "Stimulus",
          },
        ],

        // Field for single-select type
        singleSelectResponses: {
          type: Schema.Types.ObjectId,
          ref: "Stimulus",
        },
      },
    ],
  },
  { timestamps: true }
);

export const StudySession = mongoose.model<ISession>(
  "StudySession",
  SessionSchema
);

/* // Validation to ensure the correct fields are populated based on comparison type
SessionSchema.path("responses").validate(async function (responses) {
  for (const response of responses) {
    if (!response.comparison) continue;

    // If comparison is a string (ObjectId), we need to fetch the actual comparison
    let comparisonDoc = response.comparison;
    if (
      typeof comparisonDoc === "string" ||
      comparisonDoc instanceof Types.ObjectId
    ) {
      try {
        const Comparison = mongoose.model("Comparison");
        comparisonDoc = await Comparison.findById(comparisonDoc);
        if (!comparisonDoc) return false;
      } catch (error) {
        return false;
      }
    }

    // Now validate based on comparison type
    const comparisonType = comparisonDoc.type as ComparisonType;

    switch (comparisonType) {
      case "rating":
        if (!response.responses || !response.responses.length) return false;
        for (const r of response.responses) {
          if (r.stimulus === undefined || r.rating === undefined) return false;
        }
        break;

      case "single-select":
        if (!response.selectedStimulus) return false;
        break;

      case "binary":
        if (!response.responses || !response.responses.length) return false;
        for (const r of response.responses) {
          if (r.stimulus === undefined || r.selected === undefined)
            return false;
        }
        break;

      case "multi-select":
        if (!response.selectedStimuli || !response.selectedStimuli.length)
          return false;
        break;

      default:
        return false;
    }
  }

  return true;
}, "Response format does not match comparison type"); */
