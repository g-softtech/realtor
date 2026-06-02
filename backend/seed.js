// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Import your models (Adjust paths based on your folder structure)
const User = require('./models/User'); // or wherever your User model lives
const Lead = require('./models/Lead');
const Blog = require('./models/Blog');

// Pull your live MongoDB URI from environment variables
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("⚡ Connected to MongoDB Cluster for seeding...");

    // Clear existing empty or stray data safely
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Blog.deleteMany({});

    // ---- SEED USERS (With Hashed Passwords) ----
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPass2026!', salt);
    const agentPassword = await bcrypt.hash('AgentPass2026!', salt);

    const users = await User.insertMany([
      {
        name: 'Executive Admin',
        email: 'tosinawo85@gmail.com', // Your pro account mapping
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      },
      {
        name: 'Senior Broker',
        email: 'gbemijaiyeoba@gmail.com', // Your default account mapping
        password: agentPassword,
        role: 'agent',
        createdAt: new Date()
      }
    ]);
    console.log(`✅ Seeded ${users.length} User Accounts.`);

    // ---- SEED LEADS (For your Real-Time Analytics Dashboard) ----
    const leads = await Lead.insertMany([
      {
        name: 'Alhaji Ibrahim Musa',
        email: 'i.musa@capitalholdings.ng',
        phone: '+234 803 123 4567',
        propertyId: null, // Global inquiry
        message: 'Interested in private viewings for luxury 5-bedroom duplexes in Maitama.',
        status: 'new',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        name: 'Dr. Chioma Nwachukwu',
        email: 'dr.chioma@healthcorp.com',
        phone: '+234 812 987 6543',
        message: 'Looking for premium commercial office layouts or boutique retail spaces in Wuse II.',
        status: 'contacted',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]);
    console.log(`✅ Seeded ${leads.length} Active Client Leads.`);

    // ---- SEED BLOGS (To display editorial real estate insights) ----
 // ---- SEED BLOGS (To display editorial real estate insights) ----
   // ---- SEED BLOGS (To display editorial real estate insights) ----
    const blogs = await Blog.insertMany([
      {
        title: 'The Rise of Smart Luxury Architecture in Maitama',
        slug: 'rise-of-smart-luxury-maitama',
        summary: 'An inside look at the modern automation tech driving high-end property values in Abuja’s most prestigious district.',
        content: '<p>Maitama real estate is evolving beyond standard concrete structures into integrated smart ecosystems...</p>',
        author: users[0]._id, 
        status: 'published',
        publishedAt: new Date(),
        meta_description: 'Discover how smart home automation and green architecture are reshaping luxury real estate values across Maitama, Abuja.',
        // 🚀 EXACT ENUM MATCH:
        category: 'Abuja Housing Market' 
      },
      {
        title: 'Abuja Real Estate Market Analysis: 2026 Forecast',
        slug: 'abuja-real-estate-market-analysis-2026',
        summary: 'A data-driven assessment of real estate asset yields, capital appreciation trends, and premium portfolio placement.',
        content: '<p>The infrastructure investments across Guzape and Wuye are opening highly lucrative vectors for early-stage capital allocation...</p>',
        author: users[0]._id,
        status: 'published',
        publishedAt: new Date(),
        meta_description: 'An in-depth 2026 analysis of market yields, infrastructure expansions, and high-ROI property investments in Abuja.',
        // 🚀 EXACT ENUM MATCH:
        category: 'Real Estate Investment'
      }
    ]);
    console.log(`✅ Seeded ${blogs.length} Market Insight Articles.`);
    console.log("🎉 Database Ecosystem Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();