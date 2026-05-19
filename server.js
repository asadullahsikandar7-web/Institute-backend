// ═══════════════════════════════════════════════════════════════
//  PRODUCTION-READY SERVER.JS
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// ═══════════════════════════════════════════════════════════════
//  ENVIRONMENT VALIDATION (FAIL FAST)
// ═══════════════════════════════════════════════════════════════

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error("❌ MISSING REQUIRED ENVIRONMENT VARIABLES:");
  missingVars.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
//  IMPORT ROUTES
// ═══════════════════════════════════════════════════════════════

const authRoutes = require("./src/routes/auth.js");
const adminRoutes = require("./src/routes/adminRoute.js");
const studentRoutes = require("./src/routes/studentRoute.js");
const attendanceRoutes = require("./src/routes/attendanceRoute.js");
const leaveRoutes = require("./src/routes/leaveroutes.js");
const notificationRoutes = require("./src/routes/notificationRoute.js");
const examRoutes = require("./src/routes/ExamRoute.js");
const gradeRoutes = require("./src/routes/GradeRoute.js");
const feeRoutes = require("./src/routes/FeeRoute.js");
const timetableRoutes = require("./src/routes/timetableRoute.js");
const classRoutes = require("./src/routes/classRoute.js");
const analyticsRoutes = require("./src/routes/AnalyticsRoute.js");
const parentMessageRoutes = require("./src/routes/parentMessageRoute.js");

// ═══════════════════════════════════════════════════════════════
//  EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://institute-portal-psi.vercel.app",
  "https://attendance-app-asad.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ═══════════════════════════════════════════════════════════════
//  DATABASE CONNECTION (WITH PROPER ERROR HANDLING)
// ═══════════════════════════════════════════════════════════════

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

// ═══════════════════════════════════════════════════════════════
//  HEALTH CHECK ROUTES
// ═══════════════════════════════════════════════════════════════

app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "EduTrack API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "healthy" : "unhealthy",
    database: dbConnected ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// ═══════════════════════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════════════════════

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/parent-messages", parentMessageRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/analytics", analyticsRoutes);

// ═══════════════════════════════════════════════════════════════
//  ERROR HANDLING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found",
    path: req.path 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ═══════════════════════════════════════════════════════════════
//  SERVER STARTUP
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Connecting"}`);
});

// ═══════════════════════════════════════════════════════════════
//  PROCESS ERROR HANDLERS
// ═══════════════════════════════════════════════════════════════

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("⏹️ SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// ═══════════════════════════════════════════════════════════════
//  EXPORT FOR VERCEL SERVERLESS
// ═══════════════════════════════════════════════════════════════

module.exports = app;

module.exports = app;