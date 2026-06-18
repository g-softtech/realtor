const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const checkDB = async () => {
  try {
    const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';
    await mongoose.connect(uri);
    
    const props = await Property.find({}).select('title location district');
    console.log(JSON.stringify(props, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};
checkDB();
