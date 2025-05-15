import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.routes";
import studyRouter from "./routes/study.routes";
import { rateLimiter } from "./middlewares/rateLimit.middleware";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import workspacesRouter from "./routes/workspace.routes";
import stimulusRouter from "./routes/stimulus.routes";
import sessionRouter from "./routes/session.routes";
import comparisonRouter from "./routes/comparison.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";

import helmet from "helmet";
// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://group7.sustainability.it.ntnu.no",
    ],
    credentials: true,
  })
);
app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser());
app.use(helmet());
app.use(rateLimiter);

//Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/studies", studyRouter);
app.use("/api/workspaces", workspacesRouter);
app.use("/api/stimuli", stimulusRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/comparisons", comparisonRouter);
// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_DB_URL || "mongodb://database:27017/webprojectdb";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log("✅ Connected to MongoDB!");
    console.log("MongoDB URI:", process.env.MONGO_DB_URL);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit process on failure
  }
};

// Connect to the database
connectDB();

// Simple Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Server is running, and MongoDB is connected!");
});

app.use(errorHandler);

// Start the Server
const PORT = 2000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
