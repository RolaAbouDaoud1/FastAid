import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

/* ─────────────────────────────────────────────
   VISITOR: Book an appointment
──────────────────────────────────────────────── */
export const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, hospital_id, date, time, notes } = req.body;

    if (!doctor_id || !hospital_id || !date || !time) {
      return res.status(400).json({ message: "doctor_id, hospital_id, date, and time are required" });
    }

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor || !doctor.is_available) {
      return res.status(404).json({ message: "Doctor not found or unavailable" });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctor_id,
      hospital: hospital_id,
      date: new Date(date),
      time,
      notes,
    });

    await appointment.populate("doctor", "name specialization");
    await appointment.populate("hospital", "name address");

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VISITOR: Get my appointments
──────────────────────────────────────────────── */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialization image_url")
      .populate("hospital", "name address")
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VISITOR: Cancel an appointment
──────────────────────────────────────────────── */
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (["Cancelled", "Completed"].includes(appointment.status)) {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   HOSPITAL STAFF / ADMIN: Get all appointments for a hospital
──────────────────────────────────────────────── */
export const getHospitalAppointments = async (req, res) => {
  try {
    const { hospital_id, status } = req.query;
    const query = {};
    if (hospital_id) query.hospital = hospital_id;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("patient", "full_name email")
      .populate("doctor", "name specialization")
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   HOSPITAL STAFF / ADMIN: Update appointment status
──────────────────────────────────────────────── */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
