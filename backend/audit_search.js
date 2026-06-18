const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const audit = async () => {
  try {
    const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 1. Check if Atlas Search Index exists
    try {
      const searchIndexes = await Property.aggregate([
        { $listSearchIndexes: {} }
      ]);
      console.log('--- ATLAS SEARCH INDEXES ---');
      console.log(JSON.stringify(searchIndexes, null, 2));
    } catch (e) {
      console.error('Error fetching Atlas search indexes:', e.message);
    }

    // 2. Test Fuzzy query "wusee"
    console.log('\n--- TESTING FUZZY QUERY: "wusee" ---');
    try {
      const wuseeResults = await Property.aggregate([
        {
          $search: {
            index: "default",
            text: {
              query: "wusee",
              path: ["title", "location", "district"],
              fuzzy: { maxEdits: 2, prefixLength: 1 }
            }
          }
        },
        { $limit: 3 },
        { $project: { title: 1, location: 1, district: 1, score: { $meta: "searchScore" } } }
      ]);
      console.log(JSON.stringify(wuseeResults, null, 2));
    } catch (e) {
      console.log('Atlas Search Query Failed:', e.message);
    }

  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    process.exit(0);
  }
};

audit();
