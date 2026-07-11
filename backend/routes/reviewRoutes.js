import express from "express";

import {
  createReview,
  getReviews,
} from "../controllers/reviewController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.post(
  "/",
  verifyToken,
  createReview
);


router.get(
  "/",
  getReviews
);


export default router;