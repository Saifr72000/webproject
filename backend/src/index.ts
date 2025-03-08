import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.routes";
import { rateLimiter } from "./middlewares/rateLimit.middleware";

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies
app.use(rateLimiter);

//Routes
app.use("/api/users", usersRouter);

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/webproject";

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

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
