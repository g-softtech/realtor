const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, deletePropertyImage } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware'); // 🚀 Import security gates
const upload = require('../config/storage'); // 🚀 Import your cloud storage engine

// Route: /api/properties
router.get('/', getProperties); // 🔓 PUBLIC: House hunters can browse listings freely
router.get('/filters/districts', require('../controllers/propertyController').getPropertyDistricts);
router.get('/filters/types', require('../controllers/propertyController').getPropertyTypes);
router.get('/:id', getPropertyById); // 🔓 PUBLIC: Detailed view is accessible to everyone

// 🔒 SECURED: Intercept with upload.array('images', 10) to stream up to 10 photos securely to the cloud
router.post('/', protect, authorize('agent', 'admin'), upload.array('images', 10), createProperty);

// 🔒 SECURED: UPDATE PROPERTY ROUTE
router.put('/:id', protect, authorize('agent', 'admin'), upload.array('images', 10), updateProperty);

// 🗑️ DELETE PROPERTY IMAGE ROUTE
router.delete("/:id/images", protect, authorize('agent', 'admin'), deletePropertyImage);

// 🗑️ DELETE PROPERTY ROUTE
router.delete("/:id", protect, authorize('admin'), deleteProperty);

module.exports = router;