const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  district: { type: String }, // 🚀 Added standard district field to separate broad regions from specific addresses
  
  // Clean Domain Model (Replaced legacy 'type')
  purpose: { type: String, enum: ['sale', 'rent', 'short-let', null] },
  propertyType: { 
    type: String, 
    enum: [
      'duplex', 'detached-duplex', 'semi-detached-duplex', 'terrace', 
      'bungalow', 'apartment', 'penthouse', 'mansion', 'commercial', 
      'office', 'warehouse', 'land', 'mixed-use', 'other'
    ] 
  },
  
  // Physical Attributes
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  size: { type: Number },

  // UI/Business Flags
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['Available', 'Sold', 'Pending'], default: 'Available' },
  
  images: [{ type: String }], // Array of Cloudinary Image URLs
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the agent managing this listing
}, { timestamps: true });

// 🚀 Indexes for Performance
propertySchema.index({ district: 1, purpose: 1, propertyType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });

// 🚀 PHASE 1: Native MongoDB Text Index (Fallback for Atlas Search)
propertySchema.index(
  { title: 'text', location: 'text', district: 'text' },
  { weights: { title: 10, district: 5, location: 2 } }
);

module.exports = mongoose.model('Property', propertySchema);