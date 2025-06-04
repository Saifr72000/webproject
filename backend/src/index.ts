import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.routes";
import studyRouter from "./routes/study.routes";
import {
  rateLimiter,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  mediaRateLimiter,
} from "./middlewares/rateLimit.middleware";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import workspacesRouter from "./routes/workspace.routes";
import stimulusRouter from "./routes/stimulus.routes";
import sessionRouter from "./routes/session.routes";
import comparisonRouter from "./routes/comparison.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import helmet from "helmet";
import path from "path";

// Load environment variables from .env
dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "https://group7.sustainability.it.ntnu.no",
      "http://group7.sustainability.it.ntnu.no",
      "https://group7-api.sustainability.it.ntnu.no",
      "http://group7-api.sustainability.it.ntnu.no",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser());

// Serve static files BEFORE rate limiting
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: false,
  })
);

// Handle preflight requests
app.options("*", cors());

//Routes with specific rate limiting
app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/users", apiRateLimiter, usersRouter);
app.use("/api/studies", apiRateLimiter, studyRouter);
app.use("/api/workspaces", apiRateLimiter, workspacesRouter);
app.use("/api/stimuli", mediaRateLimiter, stimulusRouter); // Higher limit for media
app.use("/api/sessions", apiRateLimiter, sessionRouter);
app.use("/api/comparisons", apiRateLimiter, comparisonRouter);

app.get("/debug/ip", (req, res) => {
  res.send({ ip: req.ip, forwarded: req.headers["x-forwarded-for"] });
});
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
