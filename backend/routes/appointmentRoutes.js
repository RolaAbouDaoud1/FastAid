import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getHospitalAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Visitor
router.post("/", verifyToken, requireRole("visitor"), bookAppointment);
router.get("/my", verifyToken, requireRole("visitor"), getMyAppointments);
router.patch("/:id/cancel", verifyToken, requireRole("visitor"), cancelAppointment);

// Hospital staff / admin
router.get(
  "/hospital",
  verifyToken,
  requireRole("hospital", "admin"),
  getHospitalAppointments
);

router.patch(
  "/:id/status",
  verifyToken,
  requireRole("hospital", "admin"),
  updateAppointmentStatus
);

export default router;
