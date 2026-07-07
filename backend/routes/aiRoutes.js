/**
 * FastAid — AI Assistant Route
 * File: backend/routes/aiRoutes.js
 *
 * Proxies requests from the mobile/web app to the Python AI microservice.
 * No auth required so ambulance drivers can use it without logging in.
 */

import express from "express";
import { predictDisease, recommendHospital, listSymptoms } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/predict        – disease prediction only
router.post("/predict", predictDisease);

// POST /api/ai/recommend      – disease + speciality + best hospital routing
router.post("/recommend", recommendHospital);

// GET  /api/ai/symptoms       – returns list of all known symptom names
router.get("/symptoms", listSymptoms);

export default router;
