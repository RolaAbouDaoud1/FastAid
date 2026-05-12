import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* REGISTER */
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role, car_nb } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role,
      car_nb,
    });

    res.status(201).json({
      message: "User created",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* LOGIN */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      accessToken,
      refreshToken,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* CREATE HOSPITAL (ADMIN ONLY) */
export const createHospital = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      location_lat,
      location_long,
    } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Hospital already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hospital = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: "hospital",
      location_lat,
      location_long,
    });

    res.status(201).json({
      message: "Hospital created",
      hospital,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};