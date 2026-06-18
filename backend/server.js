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

// ⚙️ CORS MIDDLEWARE: Configured to accept traffic from port 3000 and your Vercel URL
app.use(cors({
  origin: ["http://localhost:3000", "https://realtor-frontend-alpha.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Request Logger: See exactly what hits your backend
app.use((req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.url}`);
  next();
});

// ✅ GLOBAL DATABASE CONNECTION: Connects on startup to keep the event loop alive
connectDB()
  .then(() => console.log("📦 MongoDB Core Engine Connected Successfully"))
  .catch((err) => console.error("❌ Global DB Connection Failure:", err));

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

// 🚨 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🚨 GLOBAL EXPRESS ERROR CAUGHT:");
  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({ 
    message: "A server error occurred.", 
    errorName: err.name,
    errorMessage: err.message 
  });
});

// 🚀 ISOLATED PORT SETTING: Locked to 5001 locally to prevent sharing conflicts
const PORT = 5001;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Real Estate Backend safely running on isolated port ${PORT}`);
  });
}

module.exports = app;