import express from "express";
import {
  createEmergency,
  getPendingEmergencies,
  acceptEmergency,
  updateEmergency,
  getEmergencyById,
  getAllEmergencies,
} from "../controllers/emergencyController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Visitor (or even unauthenticated — optional token)
router.post("/", verifyToken, createEmergency);

// Ambulance staff
router.get(
  "/pending",
  verifyToken,
  requireRole("ambulance_staff", "admin"),
  getPendingEmergencies
);

router.patch(
  "/:id/accept",
  verifyToken,
  requireRole("ambulance_staff", "admin"),
  acceptEmergency
);

router.patch(
  "/:id",
  verifyToken,
  requireRole("ambulance_staff", "admin"),
  updateEmergency
);

router.get(
  "/:id",
  verifyToken,
  requireRole("ambulance_staff", "admin"),
  getEmergencyById
);

// Admin
router.get("/", verifyToken, requireRole("admin"), getAllEmergencies);

export default router;
