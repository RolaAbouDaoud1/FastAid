import express from "express";

import {
  registerUser,
  loginUser,
  createHospital,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/create-hospital", createHospital);

export default router;