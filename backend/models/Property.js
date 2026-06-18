const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  district: { type: String }, // 🚀 Added standard district field to separate broad regions from specific addresses
  type: { type: String, enum: ['rent', 'sale', 'land'], required: true },
  status: { type: String, enum: ['Available', 'Sold', 'Pending'], default: 'Available' },
  images: [{ type: String }], // Array of Cloudinary Image URLs
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the agent managing this listing
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);