const Blog = require('../models/Blog');

// @desc    Get all published blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    // Public users only see published articles, sorted by newest first
    const blogs = await Blog.find({ published: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single blog post by its unique SEO slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Article listing not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new blog article
// @route   POST /api/blogs
// @access  Private (Agent/Admin Only)
const createBlog = async (req, res) => {
  try {
    const { title, content, category, meta_description, cover_image, published } = req.body;

    const blog = new Blog({
      title,
      content,
      category,
      meta_description,
      cover_image,
      published,
      author: req.user._id // Automatically binds the logging agent's ID node
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
    console.error("❌ MONGOOSE BLOG SAVE CRASH:", error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog
};