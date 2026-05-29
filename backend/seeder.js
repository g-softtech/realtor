// require("dotenv").config();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Property = require("./models/Property");

const dummyProperties = [
  {
    title: "4 Bedroom Duplex in Maitama",
    description: "Luxury 4 bedroom duplex with a BQ, swimming pool, and ample parking space.",
    price: 150000000,
    location: "Maitama, Abuja",
    type: "sale",
    status: "Available",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
  },
  {
    title: "2 Bedroom Apartment in Wuse 2",
    description: "Well finished 2 bedroom apartment in a serene and secure environment.",
    price: 5000000,
    location: "Wuse 2, Abuja",
    type: "rent",
    status: "Available",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
  },
  {
    title: "1000sqm Land in Asokoro",
    description: "Prime land suitable for high-end residential development.",
    price: 250000000,
    location: "Asokoro, Abuja",
    type: "land",
    status: "Available",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
  }
];

const seedData = async () => {
  try {
    await connectDB();
    await Property.deleteMany(); // Clear existing properties
    await Property.insertMany(dummyProperties);
    console.log("Dummy properties added successfully! 🏡");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();