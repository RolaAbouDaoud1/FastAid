import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"; 
import productRoutes from "./routes/productRoutes.js";
import tripRoutes from "./routes/trips.js";
import reviewRoutes from "./routes/reviewRoutes.js";


connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // 10mb for base64 images (National ID scans)

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/ai",aiRoutes); 
app.use("/api/products", productRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
app.get("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ ok: true });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`FastAid server running on port ${PORT}`);
});
