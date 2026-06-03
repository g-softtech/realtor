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
// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
const createProperty = async (req, res) => {
  try {
    // 🏢 Extract all enterprise fields including analytics parameters from the form body
    const { 
      title, 
      description, 
      price, 
      location, 
      type, 
      status,
      bedrooms,
      bathrooms,
      size,
      district
    } = req.body;
    
    // 📸 Extract secure cloud host URLs from req.files array populated by Multer
    let imageURLs = [];
    if (req.files && req.files.length > 0) {
      imageURLs = req.files.map(file => file.path);
    } else if (req.body.images) {
      // Fallback mechanism in case images are passed as a raw array or text fallback string
      imageURLs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // 🏗️ Build the full data document map respecting data type casting
    const propertyData = {
      title,
      description,
      price: Number(price), // Force cast string inputs safely to numbers
      location,
      type,
      status: status || "available",
      images: imageURLs, // Commit the complete array of image URLs straight to MongoDB
      // 📊 Map organizational analytics safely if your schema utilizes them:
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      size: size ? Number(size) : undefined,
      district: district || undefined
    };

    const property = new Property(propertyData);
    const createdProperty = await property.save();
    
    return res.status(201).json(createdProperty);
  } catch (error) {
    // Detailed plain text verbose logging to bypass unreadable server object bubbles
    console.error("❌ CRITICAL DATABASE VALIDATION REJECTION:");
    console.error("Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    return res.status(500).json({ 
      message: "Database insertion script rejected the data payload.", 
      error: error.message 
    });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
};