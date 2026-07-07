// backend/seeds/seedProducts.js
// Run with:  node backend/seeds/seedProducts.js
import mongoose from "mongoose";
import Product  from './models/Product.js';
import dotenv from "dotenv";
dotenv.config();

const products = [
  {
    name:     'Panadol Advance',
    price:    5.00,
    img_url:  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    category: 'pain relief',
  },
  {
    name:     'Vitamin C 1000mg',
    price:    12.50,
    img_url:  'https://images.unsplash.com/photo-1616671285441-26966f36476e?w=300',
    category: 'vitamins',
  },
  {
    name:     'Omega-3 Fish Oil',
    price:    18.00,
    img_url:  'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300',
    category: 'vitamins',
  },
  {
    name:     'Ibuprofen 400mg',
    price:    4.50,
    img_url:  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300',
    category: 'pain relief',
  },
  {
    name:     'Zinc + Magnesium',
    price:    14.99,
    img_url:  'https://images.unsplash.com/photo-1595340435958-1a4ce9d3e5a1?w=300',
    category: 'vitamins',
  },
  {
    name:     'Antiseptic Spray',
    price:    7.25,
    img_url:  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300',
    category: 'first aid',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'fastaid' });
    console.log('Connected to MongoDB (fastaid)');

    await Product.deleteMany({});          // clear existing products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products`);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();