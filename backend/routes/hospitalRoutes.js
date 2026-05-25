import express from "express";
import {
  createHospital,
  getAllHospitals,
  getNearbyHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  addHospitalReview,
  updateWards,
} from "../controllers/hospitalController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get("/nearby", getNearbyHospitals);           // GET /api/hospitals/nearby?lat=&lng=
router.get("/", getAllHospitals);                    // GET /api/hospitals?search=
router.get("/:id", getHospitalById);                // GET /api/hospitals/:id

// ── Visitor (must be logged in) ─────────────────────────────
router.post("/:id/reviews", verifyToken, addHospitalReview);  // POST /api/hospitals/:id/reviews

// ── Hospital staff: update own wards ────────────────────────
router.patch(
  "/:id/wards",
  verifyToken,
  requireRole("hospital", "admin"),
  updateWards
);

// ── Admin only ───────────────────────────────────────────────
router.post("/", verifyToken, requireRole("admin"), createHospital);
router.put("/:id", verifyToken, requireRole("admin"), updateHospital);
router.delete("/:id", verifyToken, requireRole("admin"), deleteHospital);

export default router;
