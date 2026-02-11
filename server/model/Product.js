const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },        // e.g. "Bedding · B2B"
  description: String,
  price: { type: String, required: true },           // "From $45.00" or "$39.99"
  imageUrl: { type: String, required: true },
  badge: { type: String, enum: ['b2b', 'b2c', ''] }, // optional for B2B/B2C tag
  isBestSeller: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);