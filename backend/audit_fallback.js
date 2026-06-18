const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const auditFallback = async () => {
  try {
    const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';
    await mongoose.connect(uri);

    // Test text search fallback for exact match "wuse" (since typo tolerance doesn't work in $text)
    const exactResults = await Property.find({ $text: { $search: "wuse" } })
      .select('title location district')
      .sort({ score: { $meta: "textScore" } });
    
    console.log('\n--- TEXT SEARCH EXACT: "wuse" ---');
    console.log(JSON.stringify(exactResults, null, 2));

    // Test text search fallback for partial/typo "wusee" (Should fail because $text lacks fuzziness)
    const typoResults = await Property.find({ $text: { $search: "wusee" } })
      .select('title location district')
      .sort({ score: { $meta: "textScore" } });

    console.log('\n--- TEXT SEARCH TYPO: "wusee" ---');
    console.log(JSON.stringify(typoResults, null, 2));

  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    process.exit(0);
  }
};

auditFallback();
