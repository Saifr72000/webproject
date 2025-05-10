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
  coverImageId: string | Types.ObjectId
) => {
  // Convert string IDs to ObjectId if needed
  const ownerObjectId =
    typeof ownerId === "string" ? new Types.ObjectId(ownerId) : ownerId;

  // Generate a unique public ID for the study

  const studyData: any = {
    name,
    description,
    owner: ownerObjectId,
    coverImage: coverImageId,
  };

  const newStudy = new Study(studyData);
  await newStudy.save();

  return newStudy;
};

export const getStudyByIdService = async (
  id: string
): Promise<IStudy | null> => {
  return await Study.findById(id).
  populate("coverImage")
  .populate({
    path: "comparisons",
    populate: {
      path: "options.stimulus",
      select: "-data -__v -createdAt -updatedAt",
    },
  });
};
export const getAllStudiesService = async (): Promise<IStudy[] | null> => {
  return await Study.find().populate({
    path: "comparisons",
    populate: {
      path: "options.stimulus",
      select: "-data -__v -createdAt -updatedAt",
    },
  });
}

// need to implement edit studies and update studies as well.
