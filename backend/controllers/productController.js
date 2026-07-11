// backend/controllers/productController.js

import Product from '../models/Product.js';

// GET /api/products
// Returns all in-stock products, sorted oldest-first
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ in_stock: true }).sort({ createdAt: 1 });
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('getProducts error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};