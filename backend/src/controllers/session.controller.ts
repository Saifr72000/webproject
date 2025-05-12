import { Request, Response, NextFunction } from "express";
import {
  createSession,
  addResponse,
  completeSession,
  getSessionById,
} from "../services/session.service";
import { checkSessionExists } from "../services/session.service";

export const createSessionController = async (req: Request, res: Response) => {
  try {
    const { studyId } = req.params;
    const session = await createSession(studyId);
    res.status(201).json({ session });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create session",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const addResponseController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { comparisonId, responseData } = req.body;
    const addResponseToSession = await addResponse(
      sessionId,
      comparisonId,
      responseData
    );
    res.status(200).json({ addResponseToSession });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add response",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const completeSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;
    const { demographicsData } = req.body;
    const completedSession = await completeSession(sessionId, demographicsData);
    res.status(200).json({ completedSession });
  } catch (error) {
    res.status(400).json({
      message: "Failed to complete session",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getSessionByIdController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await getSessionById(sessionId);
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get session",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const findingSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { studyId } = req.params;
  try {
    const sessionExists = await checkSessionExists(studyId);

  res.json({ sessionExists });
  } catch (error) {
    console.error("Error in controller:", error);
    next(error);
  }
};

