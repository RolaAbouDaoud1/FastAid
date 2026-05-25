import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["visitor", "ambulance_staff", "hospital", "admin"],
      default: "visitor",
    },

    // Ambulance staff only
    car_nb: {
      type: String,
    },

    // Hospital account reference
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
