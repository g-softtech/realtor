const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // Optional reference to a specific property
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);