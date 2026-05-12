import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


connectDB();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(5000,"0.0.0.0", () => {
  console.log("Server running");
});