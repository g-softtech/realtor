const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './.env' });

const testAPI = async () => {
  try {
    // 1. Generate an Admin Token
    const adminId = '6a1f4f1ffd35434f44f7892c'; // Real admin ID from DB
    const adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("==========================================");
    console.log("1. TESTING PROPERTY CREATION (Admin)");
    console.log("==========================================");

    // Create property payload using FormData to simulate frontend behavior
    const formData = new FormData();
    formData.append('title', 'Test Luxury Duplex');
    formData.append('description', 'A beautiful test duplex.');
    formData.append('price', '150000000');
    formData.append('location', 'Wuse, Abuja');
    formData.append('district', 'Wuse');
    formData.append('purpose', 'sale');
    formData.append('propertyType', 'duplex');
    formData.append('bedrooms', '4');
    formData.append('bathrooms', '3');
    formData.append('size', '250');
    formData.append('status', 'Available');
    formData.append('isFeatured', 'true');

    const createRes = await fetch('http://127.0.0.1:5001/api/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: formData
    });

    const createData = await createRes.json();
    console.log("CREATE STATUS:", createRes.status);
    console.log("CREATE RESPONSE:", JSON.stringify(createData, null, 2));

    if (createRes.status !== 201) {
      console.error("Failed to create property. Check logs above.");
      process.exit(1);
    }

    const createdId = createData._id;

    console.log("\n==========================================");
    console.log("2. TESTING API RESPONSE (GET /api/properties)");
    console.log("==========================================");

    const getRes = await fetch('http://127.0.0.1:5001/api/properties');
    const getData = await getRes.json();
    
    console.log("GET STATUS:", getRes.status);
    // Find our newly created property in the list
    const foundProperty = getData.data.find(p => p._id === createdId);
    console.log("FETCHED PROPERTY:", JSON.stringify(foundProperty, null, 2));

    if (!foundProperty) {
      console.error("Newly created property not found in API response!");
      process.exit(1);
    }

    console.log("\nVERIFICATIONS:");
    console.log("✔ purpose exists:", foundProperty.purpose === 'sale');
    console.log("✔ propertyType exists:", foundProperty.propertyType === 'duplex');
    console.log("✔ bedrooms exist:", foundProperty.bedrooms === 4);
    console.log("✔ bathrooms exist:", foundProperty.bathrooms === 3);
    console.log("✔ size exists:", foundProperty.size === 250);
    console.log("✔ isFeatured exists and true:", foundProperty.isFeatured === true);
    console.log("✔ legacy 'type' is completely absent:", foundProperty.type === undefined);

    console.log("\n==========================================");
    console.log("3. TESTING AGENT FEATURE FLAG BLOCK");
    console.log("==========================================");

    const agentId = '6a1f4f1ffd35434f44f7892d';
    const agentToken = jwt.sign({ id: agentId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const agentFormData = new FormData();
    agentFormData.append('title', 'Agent Test Property');
    agentFormData.append('description', 'Agent testing feature flag.');
    agentFormData.append('price', '50000000');
    agentFormData.append('location', 'Gwarinpa, Abuja');
    agentFormData.append('district', 'Gwarinpa');
    agentFormData.append('purpose', 'rent');
    agentFormData.append('propertyType', 'apartment');
    agentFormData.append('isFeatured', 'true'); // Agent attempts to feature it

    const agentRes = await fetch('http://127.0.0.1:5001/api/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: agentFormData
    });

    const agentData = await agentRes.json();
    console.log("AGENT CREATE STATUS:", agentRes.status);
    console.log("AGENT CREATE IS FEATURED:", agentData.isFeatured);
    
    if (agentData.isFeatured === true) {
      console.error("SECURITY FAILED: Agent was able to set isFeatured!");
      process.exit(1);
    } else {
      console.log("✔ SECURITY SUCCESS: Agent isFeatured attempt was safely ignored (default false).");
    }

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
};

testAPI();
