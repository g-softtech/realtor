const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware'); // 🚀 Import security gates
const upload = require('../config/storage'); // 🚀 Import your cloud storage engine
const Property = require("../models/Property");

// Route: /api/properties
router.get('/', getProperties); // 🔓 PUBLIC: House hunters can browse listings freely
router.get('/:id', getPropertyById); // 🔓 PUBLIC: Detailed view is accessible to everyone

// 🔒 SECURED: Intercept with upload.array('images', 10) to stream up to 10 photos securely to the cloud
router.post('/', protect, authorize('agent', 'admin'), upload.array('images', 10), createProperty);

// 🗑️ DELETE PROPERTY ROUTE
router.delete("/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property asset not found." });
    }
    
    res.json({ message: "Property asset successfully removed from portfolio." });
  } catch (error) {
    console.error("❌ Failed to delete property:", error);
    res.status(500).json({ message: "Server error during asset removal.", error: error.message });
  }
});

module.exports = router;