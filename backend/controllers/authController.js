import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

/* ─── helpers ─── */
const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ─── REGISTER (visitor / ambulance_staff) ─── */
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role, car_nb } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Only allow visitor and ambulance_staff via public register
    if (role && !["visitor", "ambulance_staff"].includes(role)) {
      return res.status(403).json({ message: "Cannot self-register with this role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (role === "ambulance_staff" && !car_nb) {
      return res.status(400).json({ message: "Car number required for ambulance staff" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "visitor",
      car_nb: role === "ambulance_staff" ? car_nb : undefined,
    });
    
    const accessToken = signAccess({ id: user._id, role: user.role });
    const refreshToken = signRefresh({ id: user._id });

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── LOGIN ─── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({
  email: email.trim().toLowerCase(),
});
    if (!user) {
      return res.status(400).json({ message: "Invalid EMAILLLL or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or Passworddddd" });
    }

    const accessToken = signAccess({ id: user._id, role: user.role });
    const refreshToken = signRefresh({ id: user._id });

    // If hospital user, include the hospital id
    let hospitalId = null;
    if (user.role === "hospital" && user.hospital) {
      hospitalId = user.hospital;
    }

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        hospital: hospitalId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// /* ─── Google sign in ─── */
// export const googleLogin = async (req, res) => {
//   try {
//     const { token } = req.body;

//     // 1. Verify token with Google
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     const email = payload.email;
//     const full_name = payload.name;

//     // 2. Check if user exists
//     let user = await User.findOne({ email });

//     // 3. If not exist → create user
//     if (!user) {
//       user = await User.create({
//         full_name,
//         email,
//         password: null, // Google users don’t use password
//         role: "visitor",
//       });
//     }

//     // 4. Create YOUR JWT (same system as normal login)
//     const accessToken = signAccess({ id: user._id, role: user.role });
//     const refreshToken = signRefresh({ id: user._id });

//     res.json({
//       accessToken,
//       refreshToken,
//       user,
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Google login failed" });
//   }
// };

/* ─── REFRESH TOKEN ─── */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = signAccess({ id: user._id, role: user.role });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

/* ─── GET CURRENT USER (me) ─── */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
