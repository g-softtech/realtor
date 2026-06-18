const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const migrate = async () => {
  try {
    const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const properties = await Property.find({ district: { $exists: false } });
    console.log(`Found ${properties.length} properties to migrate`);

    for (let prop of properties) {
      if (prop.location) {
        const parts = prop.location.split(',');
        const district = parts[0].trim();
        prop.district = district;
        await prop.save();
        console.log(`Migrated property ${prop._id} - District: ${district}`);
      }
    }

    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

migrate();
