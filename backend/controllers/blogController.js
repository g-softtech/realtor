const Blog = require('../models/Blog');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary manually for controller access
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.replace(/['"]/g, '').trim(),
    api_key: process.env.CLOUDINARY_API_KEY.replace(/['"]/g, '').trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.replace(/['"]/g, '').trim(),
  });
}

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

    let uploadedImageUrl = cover_image;

    // 📸 Upload base64 string directly to Cloudinary (Bypassing Vercel/Multer stream destruction)
    if (cover_image && cover_image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(cover_image, {
        folder: 'AbujaRealty_Blogs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
      });
      uploadedImageUrl = uploadRes.secure_url;
    }

    const blog = new Blog({
      title,
      content,
      category,
      meta_description,
      cover_image: uploadedImageUrl,
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

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only allow author or admin to update
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update this article" });
    }

    const { title, content, category, meta_description, published, cover_image: incomingCoverImage } = req.body;
    let cover_image = blog.cover_image;

    if (incomingCoverImage && incomingCoverImage.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(incomingCoverImage, {
        folder: 'AbujaRealty_Blogs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
      });
      cover_image = uploadRes.secure_url;
    } else if (incomingCoverImage) {
      cover_image = incomingCoverImage;
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.meta_description = meta_description || blog.meta_description;
    blog.cover_image = cover_image;
    if (published !== undefined) blog.published = published;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only allow author or admin to delete
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this article" });
    }

    await Blog.findByIdAndDelete(id);

    res.json({ message: "Article successfully removed." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};