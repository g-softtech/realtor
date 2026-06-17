const mongoose = require('mongoose');
const path = require('path');
// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Property = require('../models/Property');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Cluster.');

    // 🛑 ACTION REQUIRED: Replace this string with a valid User ObjectId from your database.
    // This user will become the owner of all unassigned legacy properties.
    const defaultAgentId = 'INSERT_PRIMARY_ADMIN_OR_AGENT_ID_HERE';

    if (defaultAgentId === 'INSERT_PRIMARY_ADMIN_OR_AGENT_ID_HERE') {
      console.error('❌ Error: You must edit this script and provide a valid defaultAgentId before executing.');
      process.exit(1);
    }

    console.log('Analyzing database for legacy properties missing the agent field...');
    const matchQuery = { agent: { $exists: false } };
    
    const count = await Property.countDocuments(matchQuery);
    console.log(`Found ${count} properties requiring migration.`);

    if (count === 0) {
      console.log('No migration needed. All properties have ownership assigned.');
      process.exit(0);
    }

    const result = await Property.updateMany(
      matchQuery,
      { $set: { agent: defaultAgentId } }
    );

    console.log(`🎉 Migration successful. Assigned ownership to ${result.modifiedCount} legacy properties.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
