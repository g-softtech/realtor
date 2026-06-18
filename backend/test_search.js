const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@realtor.cluster.mongodb.net/realtordb?retryWrites=true&w=majority').then(async () => {
  const Property = require('./models/Property');
  try {
    const results = await Property.aggregate([{
      $search: {
        index: 'default',
        text: {
          query: 'duplex',
          path: ['title', 'location', 'district'],
          fuzzy: { maxEdits: 2, prefixLength: 1 }
        }
      }
    }]);
    console.log('Atlas Search Success:', results.length);
  } catch (e) {
    console.log('Atlas Search Error:', e.message);
    try {
      const fb = await Property.find({ $text: { $search: 'duplex' } });
      console.log('Fallback Native Text Search Result:', fb.length);
    } catch (fbErr) {
      console.log('Fallback Error:', fbErr.message);
    }
  }
  process.exit(0);
});
