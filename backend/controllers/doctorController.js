import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

/* ─────────────────────────────────────────────
   HOSPITAL STAFF / ADMIN: Add a doctor
──────────────────────────────────────────────── */
export const addDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email, experience_years, hospital_id } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ message: "Name and specialization are required" });
    }

    // Determine which hospital
    let hospitalId = hospital_id;

    if (req.user.role === "hospital") {
      // Hospital staff can only add doctors to their own hospital
      const user = await (await import("../models/User.js")).default.findById(req.user.id);
      hospitalId = user.hospital;
    }

    if (!hospitalId) {
      return res.status(400).json({ message: "hospital_id is required" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const doctor = await Doctor.create({
      name,
      specialization,
      phone,
      email,
      experience_years: parseInt(experience_years) || 0,
      hospital: hospitalId,
      image_url: req.body.image_url || null,
    });

    res.status(201).json({ message: "Doctor added", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUBLIC: Get all doctors (optional filter by hospital)
──────────────────────────────────────────────── */
export const getDoctors = async (req, res) => {
  try {
    const { hospital, specialization, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (hospital) query.hospital = hospital;
    if (specialization) query.specialization = { $regex: specialization, $options: "i" };
    if (search) query.name = { $regex: search, $options: "i" };

    const doctors = await Doctor.find(query)
      .populate("hospital", "name address")
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    res.json({ doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUBLIC: Get single doctor
──────────────────────────────────────────────── */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("hospital", "name address phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   HOSPITAL STAFF / ADMIN: Update doctor
──────────────────────────────────────────────── */
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const allowed = ["name", "specialization", "phone", "email", "experience_years", "is_available", "image_url", "rating"];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) doctor[f] = req.body[f];
    });

    await doctor.save();
    res.json({ message: "Doctor updated", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   HOSPITAL STAFF / ADMIN: Delete doctor
──────────────────────────────────────────────── */
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
