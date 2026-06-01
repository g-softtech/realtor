const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please provide an article title'],
    trim: true 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true 
  },
  category: {
    type: String,
    required: [true, 'Please select a valid category'],
    enum: ['Real Estate Investment', 'Abuja Housing Market', 'Buying Guides'] // 🏢 PRD Mandated categories
  },
  content: { 
    type: String, 
    required: [true, 'Article content text cannot be blank'] 
  },
  cover_image: { 
    type: String,
    default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
  },
  meta_description: {
    type: String,
    required: [true, 'SEO meta description snippet is required'],
    maxLength: 160 // 🔍 Strict search engine display limit
  },
  published: { 
    type: Boolean, 
    default: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// 🚀 AUTO-GENERATE SLUG PRE-SAVE HOOK: 
// Converts "Houses for Rent in Abuja!" into "houses-for-rent-in-abuja"
// 🚀 AUTO-GENERATE SLUG PRE-SAVE HOOK (Modern Async-Await Version)
blogSchema.pre('save', async function() {
  // If the title hasn't changed, skip slug generation completely
  if (!this.isModified('title')) return;
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Strip special characters out
    .replace(/\s+/g, '-')        // Replace spaces with standard hyphens
    .replace(/-+/g, '-');        // Collapse multiple dashes into one
});

module.exports = mongoose.model('Blog', blogSchema);