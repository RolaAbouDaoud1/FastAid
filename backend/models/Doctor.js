import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    image_url: { type: String, default: null },
    experience_years: { type: Number, default: 0 },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    is_available: { type: Boolean, default: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },

    // Flag to identify seed data
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
