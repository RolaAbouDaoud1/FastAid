import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* ─── ADMIN: Create hospital ─── */
export const createHospital = async (req, res) => {
  try {
    const {
      name, email, password, phone, address,
      location_name, location_lat, location_lng,
      departments, total_beds, image_url,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const existingHospital = await Hospital.findOne({ email: email.toLowerCase() });
    if (existingHospital) return res.status(400).json({ message: "Hospital with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const lat = parseFloat(location_lat) || 0;
    const lng = parseFloat(location_lng) || 0;

    let depts = ["Emergency", "General", "ICU"];
    if (departments) {
      depts = Array.isArray(departments)
        ? departments
        : departments.split(",").map((d) => d.trim());
    }

    const beds = parseInt(total_beds) || 0;

    const hospital = await Hospital.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      location_name: location_name || "",
      location: { lat, lng },
      coordinates: { type: "Point", coordinates: [lng, lat] },
      image_url,
      departments: depts,
      total_beds: beds,
      available_beds: beds,
    });

    const account = await User.create({
      full_name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "hospital",
      hospital: hospital._id,
    });

    hospital.account = account._id;
    await hospital.save();

    res.status(201).json({
      message: "Hospital created successfully",
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        location_name: hospital.location_name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PUBLIC: Get all hospitals (with filters) ─── */
export const getAllHospitals = async (req, res) => {
  try {
    const { search, location_name, page = 1, limit = 50 } = req.query;
    const query = { is_active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { location_name: { $regex: search, $options: "i" } },
      ];
    }
    if (location_name) {
      query.location_name = { $regex: location_name, $options: "i" };
    }

    const hospitals = await Hospital.find(query)
      .select("-reviews -account")
      .sort({ average_rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Hospital.countDocuments(query);
    res.json({ hospitals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PUBLIC: Nearby hospitals ─── */
export const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 50000, limit = 30 } = req.query;
    let hospitals;

    if (lat && lng) {
      try {
        // Try geo query first
        hospitals = await Hospital.find({
          is_active: true,
          coordinates: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: parseInt(radius),
            },
          },
        })
          .select("-reviews -account")
          .limit(parseInt(limit));
      } catch (geoErr) {
        // Geo index not ready — fall back to all hospitals sorted by rating
        console.warn("Geo query failed, falling back to rating sort:", geoErr.message);
        hospitals = await Hospital.find({ is_active: true })
          .select("-reviews -account")
          .sort({ average_rating: -1 })
          .limit(parseInt(limit));
      }
    } else {
      // No location provided — return all sorted by rating
      hospitals = await Hospital.find({ is_active: true })
        .select("-reviews -account")
        .sort({ average_rating: -1 })
        .limit(parseInt(limit));
    }

    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PUBLIC: Get single hospital by ID ─── */
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate("reviews.user", "full_name")
      .populate("account", "full_name email");

    if (!hospital || !hospital.is_active) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: Update hospital ─── */
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const allowed = [
      "name", "phone", "address", "location_name", "departments",
      "total_beds", "available_beds", "is_emergency_available", "image_url",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) hospital[field] = req.body[field];
    });

    if (req.body.location_lat || req.body.location_lng) {
      const lat = parseFloat(req.body.location_lat) || hospital.location.lat;
      const lng = parseFloat(req.body.location_lng) || hospital.location.lng;
      hospital.location = { lat, lng };
      hospital.coordinates = { type: "Point", coordinates: [lng, lat] };
    }

    if (typeof req.body.departments === "string") {
      hospital.departments = req.body.departments.split(",").map((d) => d.trim());
    }

    await hospital.save();
    res.json({ message: "Hospital updated", hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADMIN: Delete (deactivate) hospital ─── */
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    hospital.is_active = false;
    await hospital.save();

    if (hospital.account) {
      await User.findByIdAndUpdate(hospital.account, { role: "visitor" });
    }

    res.json({ message: "Hospital deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── VISITOR: Add review ─── */
export const addHospitalReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital || !hospital.is_active) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const alreadyReviewed = hospital.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyReviewed) {
      alreadyReviewed.rating = rating;
      alreadyReviewed.comment = comment;
    } else {
      hospital.reviews.push({ user: req.user.id, rating, comment });
    }

    hospital.recalcRating();
    await hospital.save();

    res.json({
      message: "Review submitted",
      average_rating: hospital.average_rating,
      total_reviews: hospital.total_reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── HOSPITAL STAFF: Update wards ─── */
export const updateWards = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    if (
      req.user.role !== "admin" &&
      hospital.account?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { wards, available_beds, is_emergency_available } = req.body;
    if (wards) hospital.wards = wards;
    if (available_beds !== undefined) hospital.available_beds = available_beds;
    if (is_emergency_available !== undefined)
      hospital.is_emergency_available = is_emergency_available;

    await hospital.save();
    res.json({ message: "Hospital updated", hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
