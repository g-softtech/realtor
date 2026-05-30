require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadRoutes");
const userRoutes = require("./routes/userRoutes");

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

app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
// Explicit 404 Handler
app.use((req, res) => {
  console.log(`❌ 404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Backend route ${req.url} does not exist.` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});