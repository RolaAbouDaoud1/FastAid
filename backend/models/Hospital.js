import mongoose from "mongoose";

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  total_beds: { type: Number, default: 0 },
  available_beds: { type: Number, default: 0 },
});

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    address: { type: String },

    // Human-readable city/area name (e.g. "Beirut", "Sidon", "Tripoli")
    location_name: { type: String, default: "" },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // GeoJSON for $near queries
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    image_url: { type: String, default: null },
    departments: { type: [String], default: ["Emergency", "General", "ICU"] },
    wards: { type: [wardSchema], default: [] },

    reviews: { type: [reviewSchema], default: [] },
    average_rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 },

    is_emergency_available: { type: Boolean, default: true },
    total_beds: { type: Number, default: 0 },
    available_beds: { type: Number, default: 0 },

    account: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    is_active: { type: Boolean, default: true },

    // Flag to identify seed data (admin can still edit these)
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hospitalSchema.index({ coordinates: "2dsphere" });

hospitalSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) {
    this.average_rating = 0;
    this.total_reviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.average_rating = parseFloat((sum / this.reviews.length).toFixed(1));
    this.total_reviews = this.reviews.length;
  }
};

export default mongoose.model("Hospital", hospitalSchema);
