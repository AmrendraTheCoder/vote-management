import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import process from "process";

// Import routes
import studentRoutes from "../routes/students.js";

// Load environment variables
dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet()); // Security headers
app.use(limiter); // Rate limiting
app.use(morgan("combined")); // Logging
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174", // Vite dev server (alternative port)
      "http://localhost:3000", // React dev server
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/students", studentRoutes);

// Global error handler
app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Database connection
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/vote_manager";

    const conn = await mongoose.connect(mongoURI);

    cachedDb = conn;
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

// Export for Vercel
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  
  connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
