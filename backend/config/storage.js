const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your secure environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up the secure remote storage folder engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'AbujaRealty_Properties', // Creates a dedicated folder inside your Cloudinary media library
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // 🔒 Security: Restrict file types strictly to images
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }], // 📏 Media Standard: Enforces high resolution optimization
  },
});

// Initialize the upload parser middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 🔒 Security: Max 5MB file sizes to protect backend performance
});

module.exports = upload;