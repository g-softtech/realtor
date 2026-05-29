const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty } = require('../controllers/propertyController');

// Route: /api/properties
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', createProperty);

module.exports = router;