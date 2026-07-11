import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getDoctors);            // GET /api/doctors?hospital=&specialization=&search=
router.get("/:id", getDoctorById);      // GET /api/doctors/:id

// Hospital staff or admin
router.post(
  "/",
  verifyToken,
  requireRole("hospital", "admin"),
  addDoctor
);

router.put(
  "/:id",
  verifyToken,
  requireRole("hospital", "admin"),
  updateDoctor
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("hospital", "admin"),
  deleteDoctor
);

export default router;
