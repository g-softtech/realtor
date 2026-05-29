require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Realtor API Running 🚀");
});

app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});