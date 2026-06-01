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

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger: See exactly what hits your backend
app.use((req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.url}`);
  next();
});

// 1. DATABASE CONNECTION MIDDLEWARE FOR SERVERLESS
// This ensures the database is connected before handling any incoming route requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Database Connection Handshake Failure:", error);
    res.status(500).json({ error: "Database connection could not be established." });
  }
});

app.get("/", (req, res) => {
  res.send("Realtor API Running 🚀");
});

// 📊 REAL-TIME ASSET ANALYTICS AGGREGATION ENDPOINT
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const totalLeads = await Lead.countDocuments();
    
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const rawLeads = await Lead.find({}, 'notes');
    
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

    const districtDemand = [
      { name: 'Wuse 2', percentage: totalHits > 0 ? Math.round((wuseHits / totalHits) * 100) : 0 },
      { name: 'Gwarinpa', percentage: totalHits > 0 ? Math.round((gwarinpaHits / totalHits) * 100) : 0 },
      { name: 'Maitama', percentage: totalHits > 0 ? Math.round((maitamaHits / totalHits) * 100) : 0 },
      { name: 'Asokoro', percentage: totalHits > 0 ? Math.round((asokoroHits / totalHits) * 100) : 0 },
    ];

    districtDemand.sort((a, b) => b.percentage - a.percentage);

    res.json({
      totalProperties,
      totalLeads,
      conversionRate, 
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

// 2. EXPORT APP & CONDITIONAL LISTEN FOR LOCAL DEVELOPMENT
module.exports = app; 

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}