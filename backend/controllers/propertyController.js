const Property = require("../models/Property");

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: "Property not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, type, status } = req.body;
    
    // 📸 Extract secure cloud host URLs from req.files array populated by Multer
    let imageURLs = [];
    if (req.files && req.files.length > 0) {
      imageURLs = req.files.map(file => file.path);
    } else if (req.body.images) {
      // Fallback fallback mechanism in case images are passed as a raw string/array array
      imageURLs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      type,
      status,
      images: imageURLs, // 🚀 Commit the complete array of image URLs straight to MongoDB
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    console.error("❌ DB SAVE CRASH:", error); 
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
};