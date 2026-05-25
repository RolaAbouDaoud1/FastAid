import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "dispatched", "arrived", "completed", "cancelled"],
      default: "pending",
    },

    assigned_ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ambulance_staff user
    },

    assigned_hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    // Vitals logged by ambulance staff
    vitals: {
      heart_rate: { type: String },
      blood_pressure: { type: String },
      oxygen: { type: String },
    },

    // Timeline events logged on-scene
    timeline: [
      {
        event: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // National ID image (base64 or URL if using file storage)
    patient_id_image: {
      type: String,
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emergency", emergencySchema);
