import express from "express";
import { createComparison, updateComparisonController, deleteComparisonController, getComparisons, getComparisonId} from "../controllers/comparison.controller";
import { upload } from "../middlewares/upload.middleware";
const comparisonRouter = express.Router();


const router = express.Router();

router.post(
  "/study/:studyId",
  upload.array("files"),
  createComparison
);

router.get("/study/:studyId", getComparisons);
router.get("/:id", getComparisonId);
router.put("/:id", updateComparisonController);
router.delete("/:id", deleteComparisonController);

export default comparisonRouter;

