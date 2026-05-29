const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check for either MONGO_URI or DATABASE_URL
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!uri) {
      throw new Error("Database connection string is missing in .env file.");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;