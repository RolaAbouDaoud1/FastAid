import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// Protected
router.get("/me", verifyToken, getMe);

export default router;
