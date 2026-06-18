const Property = require("../models/Property");

// 🛠️ Guardrail helper for District normalization
const normalizeDistrict = (districtStr) => {
  if (!districtStr) return undefined;
  // Trim spaces and Title Case (e.g., " maitama " -> "Maitama")
  return districtStr.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// 🛠️ Guardrail helper for Type normalization
const normalizeType = (typeStr) => {
  if (!typeStr) return undefined;
  return typeStr.trim().toLowerCase();
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const { search, district, type } = req.query;
    let query = {};
    
    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { location: { $regex: sanitizedSearch, $options: "i" } }
      ];
    }
    
    if (district && district !== 'All' && district !== '') {
      query.district = district;
    }
    
    if (type && type !== 'All' && type !== '') {
      query.type = type;
    }

    const properties = await Property.find(query);
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
      type: normalizeType(type),
      status: status || "available",
      images: imageURLs, // Commit the complete array of image URLs straight to MongoDB
      // 📊 Map organizational analytics safely if your schema utilizes them:
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      size: size ? Number(size) : undefined,
      district: normalizeDistrict(district),
      agent: req.user._id // Assign ownership to the creating user
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

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Agent/Admin)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const { 
      title, description, price, location, type, status, bedrooms, bathrooms, size, district
    } = req.body;

    let imageURLs = property.images;
    if (req.files && req.files.length > 0) {
      imageURLs = [...imageURLs, ...req.files.map(file => file.path)];
    } else if (req.body.images) {
      imageURLs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price ? Number(price) : property.price;
    property.location = location || property.location;
    property.type = type ? normalizeType(type) : property.type;
    property.status = status || property.status;
    property.images = imageURLs;
    property.bedrooms = bedrooms ? Number(bedrooms) : property.bedrooms;
    property.bathrooms = bathrooms ? Number(bathrooms) : property.bathrooms;
    property.size = size ? Number(size) : property.size;
    
    if (district !== undefined) {
      property.district = normalizeDistrict(district);
    }

    const updatedProperty = await property.save();
    return res.json(updatedProperty);
  } catch (error) {
    console.error("❌ Failed to update property:", error);
    return res.status(500).json({ message: "Server error during asset update.", error: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Agent/Admin)
const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property asset not found." });
    }
    
    return res.json({ message: "Property asset successfully removed from portfolio." });
  } catch (error) {
    console.error("❌ Failed to delete property:", error);
    return res.status(500).json({ message: "Server error during asset removal.", error: error.message });
  }
};

// @desc    Delete a single image from a property
// @route   DELETE /api/properties/:id/images?url=...
// @access  Private (Agent/Admin)
const deletePropertyImage = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: "Image URL parameter is required." });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property asset not found." });
    }

    // 🔒 OWNERSHIP ENFORCEMENT
    if (req.user.role === 'agent') {
      if (!property.agent || property.agent.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: You can only manage images for properties you created." });
      }
    }

    if (!property.images.includes(url)) {
      return res.status(400).json({ message: "Image not associated with this property." });
    }

    // 📸 CLOUDINARY EXTRACTION: Robust regex capturing the entire path after /upload/
    // This safely handles nested folders, version tags (v1234), and dots in filenames
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (!match || !match[1]) {
      return res.status(400).json({ message: "Invalid Cloudinary URL format. Could not extract public_id." });
    }
    const publicId = match[1];

    // 🗑️ Trigger external cloud destruction
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(publicId);

    // 🏗️ Database synchronization
    property.images = property.images.filter(img => img !== url);
    await property.save();

    return res.json({ message: "Image asset permanently deleted.", images: property.images });
  } catch (error) {
    console.error("❌ Failed to delete image:", error);
    return res.status(500).json({ message: "Server error during image removal.", error: error.message });
  }
};

// @desc    Get distinct property districts
// @route   GET /api/properties/filters/districts
// @access  Public
const getPropertyDistricts = async (req, res) => {
  try {
    const districts = await Property.distinct("district");
    const validDistricts = districts.filter(Boolean).sort((a, b) => a.localeCompare(b)); // remove null/undefined and sort alphabetically
    res.json(validDistricts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get distinct property types
// @route   GET /api/properties/filters/types
// @access  Public
const getPropertyTypes = async (req, res) => {
  try {
    const types = await Property.distinct("type");
    const validTypes = types.filter(Boolean).sort((a, b) => a.localeCompare(b));
    res.json(validTypes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  getPropertyDistricts,
  getPropertyTypes,
};