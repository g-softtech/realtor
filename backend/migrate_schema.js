const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';

const migrate = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for schema migration.');

    // We must use strict:false to access the old 'type' field that was removed from the schema
    const properties = await Property.find({}, null, { strict: false });
    
    let updatedCount = 0;

    for (let property of properties) {
      const doc = property.toObject(); // Get raw document including fields not in schema
      const oldType = doc.type;
      
      let purpose = null;
      let propertyType = 'other';
      
      if (oldType === 'sale') {
        purpose = 'sale';
        propertyType = 'duplex'; // As inferred from the db earlier
      } else if (oldType === 'rent') {
        purpose = 'rent';
      } else if (oldType === 'land') {
        purpose = null; // User explicitly requested null for manual review
        propertyType = 'land';
      } else if (!oldType) {
        // If type is already missing, maybe it was migrated? Just set defaults
        purpose = 'sale';
      }

      // Try to intelligently infer propertyType from title if it's not land
      if (oldType !== 'land' && doc.title) {
        const titleLower = doc.title.toLowerCase();
        if (titleLower.includes('duplex')) propertyType = 'duplex';
        else if (titleLower.includes('penthouse')) propertyType = 'penthouse';
        else if (titleLower.includes('mansion')) propertyType = 'mansion';
        else if (titleLower.includes('apartment')) propertyType = 'apartment';
        else if (titleLower.includes('bungalow')) propertyType = 'bungalow';
        else if (titleLower.includes('terrace')) propertyType = 'terrace';
      }

      // Update document
      await Property.collection.updateOne(
        { _id: property._id },
        { 
          $set: { 
            purpose, 
            propertyType,
            bedrooms: null,
            bathrooms: null,
            size: null,
            isFeatured: false
          },
          $unset: { type: "" } // Drop legacy field permanently
        }
      );
      updatedCount++;
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} records.`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
};

migrate();
