const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog } = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/storage'); // 🚀 Reuse our secure cloud upload engine

// Route: /api/blogs
router.route('/')
  .get(getBlogs) // 🔓 PUBLIC: Homebuyers can read articles freely for organic SEO traffic
  // 🔒 SECURED: Intercept with upload.single('cover_image') to upload one cover photo to Cloudinary
  .post(protect, authorize('agent', 'admin'), upload.single('cover_image'), (req, res, next) => {
    // If a file was uploaded, bind its secure path to req.body so the controller saves it
    if (req.file) {
      req.body.cover_image = req.file.path;
    }
    next();
  }, createBlog);

// Route: /api/blogs/:slug
router.route('/:slug')
  .get(getBlogBySlug); // 🔓 PUBLIC: Dynamic route lookup via slug keyword string

module.exports = router;