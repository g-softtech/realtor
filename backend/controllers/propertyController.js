const Property = require("../models/Property");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary manually for controller access
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.replace(/['"]/g, '').trim(),
    api_key: process.env.CLOUDINARY_API_KEY.replace(/['"]/g, '').trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.replace(/['"]/g, '').trim(),
  });
}

// 🛠️ Guardrail helper for District normalization
const normalizeDistrict = (districtStr) => {
  if (!districtStr) return undefined;
  // Trim spaces and Title Case (e.g., " maitama " -> "Maitama")
  return districtStr.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// 🛠️ Guardrail helper for Purpose/PropertyType normalization
const normalizeString = (str) => {
  if (!str) return undefined;
  return str.trim().toLowerCase();
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const { search, district, purpose, propertyType, minPrice, maxPrice, bedrooms, sort, page = 1, limit = 10 } = req.query;
    
    // Pagination Params
    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    const skip = (pageNum - 1) * limitNum;

    // Filter Params
    let matchStage = {};
    if (district && district !== 'All' && district !== '') matchStage.district = district;
    if (purpose && purpose !== 'All' && purpose !== '') matchStage.purpose = purpose;
    if (propertyType && propertyType !== 'All' && propertyType !== '') matchStage.propertyType = propertyType;
    
    // Numeric Filters
    if (bedrooms && bedrooms !== 'All' && bedrooms !== '') {
      const bedsNum = Number(bedrooms);
      if (!isNaN(bedsNum)) {
        matchStage.bedrooms = { $gte: bedsNum };
      }
    }
    
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice && !isNaN(Number(minPrice))) matchStage.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) matchStage.price.$lte = Number(maxPrice);
      if (Object.keys(matchStage.price).length === 0) delete matchStage.price;
    }
    
    // Sorting Params (No relevance sorting yet, industry standard Newest/Price)
    let sortStage = { createdAt: -1 }; // Default: Newest
    if (sort === 'price-asc') sortStage = { price: 1 };
    else if (sort === 'price-desc') sortStage = { price: -1 };

    let data = [];
    let totalItems = 0;

    if (search) {
      // 🚀 PHASE 2: Try Atlas Search Pipeline (Industry Standard for Fuzzy/Relevance)
      let pipeline = [
        {
          $search: {
            index: "default",
            text: {
              query: search,
              path: ["title", "location", "district"],
              fuzzy: { maxEdits: 2, prefixLength: 1 }
            }
          }
        }
      ];

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push({ $sort: sortStage });

      pipeline.push({
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: "count" }]
        }
      });

      try {
        const results = await Property.aggregate(pipeline);
        data = results[0].data;
        totalItems = results[0].totalCount[0] ? results[0].totalCount[0].count : 0;
      } catch (err) {
        // Fallback to MongoDB native $text index if Atlas is unavailable
        console.warn("Atlas Search missing or failed. Falling back to native $text index.");
        const fallbackQuery = { ...matchStage, $text: { $search: search } };
        totalItems = await Property.countDocuments(fallbackQuery);
        data = await Property.find(fallbackQuery)
          .sort(sortStage)
          .skip(skip)
          .limit(limitNum);
      }
    } else {
      // Standard database fetch without text search
      totalItems = await Property.countDocuments(matchStage);
      data = await Property.find(matchStage).sort(sortStage).skip(skip).limit(limitNum);
    }

    const totalPages = Math.ceil(totalItems / limitNum);

    // 🚀 PHASE 3: Unified paginated API contract structure
    res.json({
      data,
      page: pageNum,
      totalPages: totalPages === 0 ? 1 : totalPages,
      totalItems
    });
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
      purpose,
      propertyType, 
      status,
      bedrooms,
      bathrooms,
      size,
      district,
      isFeatured,
      images
    } = req.body;
    
    // 📸 Upload base64 strings directly to Cloudinary (Bypassing Vercel/Multer stream destruction)
    let imageURLs = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith('data:image')) {
          const uploadRes = await cloudinary.uploader.upload(img, {
            folder: 'AbujaRealty_Properties',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
          });
          imageURLs.push(uploadRes.secure_url);
        } else {
          imageURLs.push(img); // Handle existing or plain string fallback
        }
      }
    } else if (images && typeof images === 'string') {
      if (images.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(images, {
          folder: 'AbujaRealty_Properties',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
        });
        imageURLs.push(uploadRes.secure_url);
      } else {
        imageURLs.push(images);
      }
    }

    // 🏗️ Build the full data document map respecting data type casting
    const propertyData = {
      title,
      description,
      price: Number(price), // Force cast string inputs safely to numbers
      location,
      purpose: normalizeString(purpose),
      propertyType: normalizeString(propertyType),
      status: status || "Available",
      images: imageURLs, // Commit the complete array of image URLs straight to MongoDB
      // 📊 Map organizational analytics safely if your schema utilizes them:
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      size: size ? Number(size) : undefined,
      district: normalizeDistrict(district),
      agent: req.user._id // Assign ownership to the creating user
    };
    
    // 🔒 RBAC Check for Featured Flag
    if (isFeatured && req.user && req.user.role === 'admin') {
      propertyData.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

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
      title, description, price, location, purpose, propertyType, status, bedrooms, bathrooms, size, district, isFeatured, images
    } = req.body;

    let imageURLs = property.images || [];
    
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith('data:image')) {
          const uploadRes = await cloudinary.uploader.upload(img, {
            folder: 'AbujaRealty_Properties',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
          });
          imageURLs.push(uploadRes.secure_url);
        } else if (!imageURLs.includes(img)) {
          imageURLs.push(img);
        }
      }
    } else if (images && typeof images === 'string') {
      if (images.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(images, {
          folder: 'AbujaRealty_Properties',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
        });
        imageURLs.push(uploadRes.secure_url);
      } else if (!imageURLs.includes(images)) {
        imageURLs.push(images);
      }
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price ? Number(price) : property.price;
    property.location = location || property.location;
    property.purpose = purpose ? normalizeString(purpose) : property.purpose;
    property.propertyType = propertyType ? normalizeString(propertyType) : property.propertyType;
    property.status = status || property.status;
    property.images = imageURLs;
    property.bedrooms = bedrooms ? Number(bedrooms) : property.bedrooms;
    property.bathrooms = bathrooms ? Number(bathrooms) : property.bathrooms;
    property.size = size ? Number(size) : property.size;
    
    if (district !== undefined) {
      property.district = normalizeDistrict(district);
    }

    // 🔒 RBAC Check for Featured Flag
    if (isFeatured !== undefined && req.user && req.user.role === 'admin') {
      property.isFeatured = isFeatured === 'true' || isFeatured === true;
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

// @desc    Get distinct property purposes
// @route   GET /api/properties/filters/purposes
// @access  Public
const getPropertyPurposes = async (req, res) => {
  try {
    const purposes = await Property.distinct("purpose");
    const validPurposes = purposes.filter(Boolean).sort((a, b) => a.localeCompare(b));
    res.json(validPurposes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get distinct property types
// @route   GET /api/properties/filters/propertyTypes
// @access  Public
const getPropertyTypes = async (req, res) => {
  try {
    const types = await Property.distinct("propertyType");
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
  getPropertyPurposes,
  getPropertyTypes,
};