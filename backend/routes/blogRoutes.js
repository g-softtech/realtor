const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route: /api/blogs
router.route('/')
  .get(getBlogs) // 🔓 PUBLIC: Homebuyers can read articles freely for organic SEO traffic
  // 🔒 SECURED: Process application/json payload directly
  .post(protect, authorize('agent', 'admin'), createBlog);

// Route: /api/blogs/:id
router.route('/:id')
  // 🔒 SECURED: Update a specific blog by ID
  .put(protect, authorize('agent', 'admin'), updateBlog)
  // 🔒 SECURED: Delete a specific blog by ID
  .delete(protect, authorize('agent', 'admin'), deleteBlog);

// Route: /api/blogs/:slug
router.get('/:slug', getBlogBySlug); // 🔓 PUBLIC: Dynamic route lookup via slug keyword string

module.exports = router;