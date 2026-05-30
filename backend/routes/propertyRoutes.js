const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware'); // 🚀 Import security gates

// Route: /api/properties
router.get('/', getProperties); // 🔓 PUBLIC: House hunters can browse listings freely
router.get('/:id', getPropertyById); // 🔓 PUBLIC: Detailed view is accessible to everyone

// 🔒 SECURED: Only authenticated Agents or Admins can inject new listings into MongoDB
router.post('/', protect, authorize('agent', 'admin'), createProperty);

module.exports = router;