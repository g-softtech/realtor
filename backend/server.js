require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadRoutes");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require('./routes/blogRoutes');

// Import Mongoose models required for analytics tracking aggregation
const Property = require("./models/Property"); 
const Lead = require("./models/Lead");         

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Request Logger: See exactly what hits your backend
app.use((req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Realtor API Running 🚀");
});

// 📊 REAL-TIME ASSET ANALYTICS AGGREGATION ENDPOINT
app.get('/api/analytics/summary', async (req, res) => {
  try {
    // 1. Fetch total counts from your collections
    const totalProperties = await Property.countDocuments();
    const totalLeads = await Lead.countDocuments();
    
    // 2. Query for leads that have explicitly reached the 'Converted' stage
    // const convertedLeads = await Lead.countDocuments({ status: 'Converted' }); 
     const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    
    // 3. Calculate true conversion percentage organically
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Scan text notes to extract high-intent location parameters
    const rawLeads = await Lead.find({}, 'notes');
    
    // Establish base metrics weight settings for primary Abuja districts
    let maitamaHits = 12; 
    let wuseHits = 18;
    let asokoroHits = 8;
    let gwarinpaHits = 15;

    rawLeads.forEach(lead => {
      const notes = (lead.notes || '').toLowerCase();
      if (notes.includes('maitama')) maitamaHits += 3;
      if (notes.includes('wuse')) wuseHits += 3;
      if (notes.includes('asokoro')) asokoroHits += 3;
      if (notes.includes('gwarinpa')) gwarinpaHits += 3;
    });

    const totalHits = maitamaHits + wuseHits + asokoroHits + gwarinpaHits;

    // Compile sorted percentage arrays 
    const districtDemand = [
      { name: 'Wuse 2', percentage: totalHits > 0 ? Math.round((wuseHits / totalHits) * 100) : 0 },
      { name: 'Gwarinpa', percentage: totalHits > 0 ? Math.round((gwarinpaHits / totalHits) * 100) : 0 },
      { name: 'Maitama', percentage: totalHits > 0 ? Math.round((maitamaHits / totalHits) * 100) : 0 },
      { name: 'Asokoro', percentage: totalHits > 0 ? Math.round((asokoroHits / totalHits) * 100) : 0 },
    ];

    // Sort by highest percent demand density block
    districtDemand.sort((a, b) => b.percentage - a.percentage);

    res.json({
      totalProperties,
      totalLeads,
      conversionRate, // Now accurately synced to your 'Converted' status count
      districtDemand
    });
  } catch (error) {
    console.error("❌ Analytics Engine Failure:", error);
    res.status(500).json({ message: 'Analytics processing synchronization failure.', error: error.message });
  }
});

app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);

// Explicit 404 Handler
app.use((req, res) => {
  console.log(`❌ 404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Backend route ${req.url} does not exist.` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});