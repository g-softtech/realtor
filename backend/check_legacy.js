const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Property = require('./models/Property');
  const legacyCount = await Property.countDocuments({ agent: { $exists: false } });
  const total = await Property.countDocuments();
  console.log('Legacy Properties:', legacyCount);
  console.log('Total Properties:', total);
  process.exit(0);
}).catch(console.error);
