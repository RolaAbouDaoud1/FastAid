/**
 * FastAid — Create Admin Account
 * Run: node createAdmin.js
 *
 * Creates a single admin user you can log in with.
 * Safe to re-run — won't duplicate if the email already exists.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

const ADMIN_EMAIL    = "admin@fastaid.lb";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME     = "FastAid Admin";

const existing = await User.findOne({ email: ADMIN_EMAIL });

if (existing) {
  console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
} else {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    full_name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: "admin",
  });
  console.log("✅ Admin account created!");
}

console.log("\n─────────────────────────────────────");
console.log("  Email    : admin@fastaid.lb");
console.log("  Password : Admin@123");
console.log("─────────────────────────────────────\n");

await mongoose.disconnect();
