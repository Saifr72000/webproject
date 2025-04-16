import { Study, IStudy } from "../models/study.model";
import { IComparison, ComparisonType } from "../models/comparison.model";
import { createComparisonService } from "./comparison.service";
import mongoose, { Types } from "mongoose";

// To get the complete study with comparisons and stimuli populated,
// remember we need to add pagination to the comparisons.

export const createStudyService = async (
  name: string,
  description: string,
  ownerId: string | Types.ObjectId,
  workspaceId: string | Types.ObjectId,
  demographicsEnabled?: boolean
) => {
  // Convert string IDs to ObjectId if needed
  const ownerObjectId =
    typeof ownerId === "string" ? new Types.ObjectId(ownerId) : ownerId;

  const workspaceObjectId =
    typeof workspaceId === "string"
      ? new Types.ObjectId(workspaceId)
      : workspaceId;

  // Generate a unique public ID for the study

  const studyData: any = {
    name,
    description,
    owner: ownerObjectId,
    workspace: workspaceObjectId,
  };

  // Add demographics configuration if specified
  // Will have to redo this one later because we will always just uset default demographics for the mvp
  // Check the study model for later modifications
  if (demographicsEnabled !== undefined) {
    studyData.demographics = {
      enabled: demographicsEnabled,
      // fields will use the default from the model
    };
  }
  const newStudy = new Study(studyData);
  await newStudy.save();

  return newStudy;
};

export const getCompleteStudy = async (id: string): Promise<IStudy | null> => {
  return await Study.findById(id).populate({
    path: "comparisons",
    options: { sort: { order: 1 } },
    populate: {
      path: "stimuli",
    },
  });
};

/* export const createStudyWithComparisons = async (
    name: string,
    description: string,
    owner: string,
    workspace: string,
    comparisons: ComparisonInput[] = [],
    demographics?: {
      enabled: boolean;
      fields?: Array<{
        id: string;
        label: string;
        required: boolean;
        options: Array<{
          value: string;
          label: string;
        }>;
      }>;
    }
  ): Promise<{ study: IStudy; comparisons: IComparison[] }> => {
    // start a mongodb transaction for atomicity and data integrity manageement
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // create the new study
      const study = new Study({
        name,
        description,
        owner: new Types.ObjectId(owner),
        workspace: new Types.ObjectId(workspace),
        demographics: demographics || { enabled: true },
      });
  
      await study.save({ session });
  
      const createdComparisons: IComparison[] = [];
  
      if (comparisons.length > 0) {
        for (const comp of comparisons) {
          const comparison = await createComparison(
            study._id.toString(),
            comp.question,
            comp.type,
            comp.stimuli,
            comp.order,
            comp.instructions,
            comp.config,
            session
          );
  
          createdComparisons.push(comparison);
        }
      }
  
      await session.commitTransaction();
      session.endSession();
  
      return { study, comparisons: createdComparisons };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }; */

export const getStudyByIdService = async (
  id: string
): Promise<IStudy | null> => {
  return await Study.findById(id).populate({
    path: "comparisons",
    options: { sort: { order: 1 } },
    populate: { path: "stimuli", select: "-data" },
  });
};
