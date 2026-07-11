// backend/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    img_url:   { type: String, required: true },
    category:  { type: String, default: 'general' },
    in_stock:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Product', productSchema);
export default mongoose.model("Product", productSchema);