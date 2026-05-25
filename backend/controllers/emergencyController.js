import Emergency from "../models/Emergency.js";
import Hospital from "../models/Hospital.js";

/* ─────────────────────────────────────────────
   VISITOR: Trigger emergency request
──────────────────────────────────────────────── */
export const createEmergency = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location (lat, lng) is required" });
    }

    const emergency = await Emergency.create({
      requested_by: req.user?.id || null,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      status: "pending",
    });

    res.status(201).json({
      message: "Emergency request created",
      emergency_id: emergency._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   AMBULANCE STAFF: Get pending emergencies
──────────────────────────────────────────────── */
export const getPendingEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: "pending" })
      .populate("requested_by", "full_name email")
      .sort({ createdAt: -1 });

    res.json({ emergencies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   AMBULANCE STAFF: Accept / dispatch emergency
──────────────────────────────────────────────── */
export const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    if (emergency.status !== "pending") {
      return res.status(400).json({ message: "Emergency already handled" });
    }

    emergency.status = "dispatched";
    emergency.assigned_ambulance = req.user.id;
    emergency.timeline.push({ event: "Ambulance dispatched" });

    await emergency.save();
    res.json({ message: "Emergency accepted", emergency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   AMBULANCE STAFF: Update emergency (vitals, timeline, status)
──────────────────────────────────────────────── */
export const updateEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    // Only the assigned ambulance or admin can update
    if (
      req.user.role !== "admin" &&
      emergency.assigned_ambulance?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { status, vitals, timeline_event, assigned_hospital, patient_id_image, notes } = req.body;

    const validStatuses = ["dispatched", "arrived", "completed", "cancelled"];
    if (status && validStatuses.includes(status)) {
      emergency.status = status;
    }

    if (vitals) {
      emergency.vitals = { ...emergency.vitals, ...vitals };
    }

    if (timeline_event) {
      emergency.timeline.push({ event: timeline_event });
    }

    if (assigned_hospital) {
      emergency.assigned_hospital = assigned_hospital;
    }

    if (patient_id_image) {
      emergency.patient_id_image = patient_id_image;
    }

    if (notes) emergency.notes = notes;

    await emergency.save();
    res.json({ message: "Emergency updated", emergency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   AMBULANCE STAFF / ADMIN: Get single emergency
──────────────────────────────────────────────── */
export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate("requested_by", "full_name")
      .populate("assigned_hospital", "name address phone");

    if (!emergency) return res.status(404).json({ message: "Emergency not found" });
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN: Get all emergencies (filterable)
──────────────────────────────────────────────── */
export const getAllEmergencies = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const emergencies = await Emergency.find(query)
      .populate("requested_by", "full_name")
      .populate("assigned_ambulance", "full_name car_nb")
      .populate("assigned_hospital", "name")
      .sort({ createdAt: -1 });

    res.json({ emergencies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
