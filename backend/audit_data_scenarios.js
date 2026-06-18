const mongoose = require('mongoose');
const Property = require('./models/Property.js');

const audit = async () => {
  try {
    const uri = 'mongodb+srv://realtorApp:CtNpQQ2DavyW-9i@impactconnect-cluster.lvslh3h.mongodb.net/realtor?appName=impactconnect-cluster';
    await mongoose.connect(uri);

    const report = { data: {}, searchScenarios: {}, filters: {}, combined: {} };

    // 1. DATA
    report.data.totalProperties = await Property.countDocuments();
    report.data.districts = await Property.distinct('district');
    report.data.types = await Property.distinct('type');
    report.data.samples = await Property.find().limit(3).select('title district location type price bedrooms');

    // 2. KEYWORD SEARCH (Using exactly what getProperties fallback uses: $text, or if we want exact/partial, we use regex to see what the native DB holds. Wait, getProperties uses Atlas Search -> $text fallback. Since Atlas Search isn't active, it uses $text. Let's test using $text to see exactly what the API returns).
    const executeSearch = async (query) => {
        return await Property.find(query).countDocuments();
    };
    const executeTextSearch = async (term) => {
        return await Property.find({ $text: { $search: term } }).countDocuments();
    };

    report.searchScenarios.exactTitle = await executeTextSearch('\"7 Bedroom Duplex in Maitama\"'); 
    report.searchScenarios.partialTitle = await executeTextSearch('duplex');
    report.searchScenarios.location = await executeTextSearch('Asokoro');
    report.searchScenarios.mixedCase = await executeTextSearch('mAITama');
    report.searchScenarios.withSpaces = await executeTextSearch('  lugbe  ');

    // 3. DISTRICT FILTERS
    for (const dist of report.data.districts) {
        if(dist) report.filters[`district_${dist}`] = await executeSearch({ district: dist });
    }

    // 4. TYPE FILTERS
    for (const type of report.data.types) {
        if(type) report.filters[`type_${type}`] = await executeSearch({ type });
    }

    // 5. COMBINED
    report.combined.searchOnly = await executeTextSearch('duplex');
    report.combined.districtOnly = await executeSearch({ district: 'Maitama' });
    report.combined.typeOnly = await executeSearch({ type: 'sale' });
    
    // For combinations, we must combine $text and district
    report.combined.searchAndDistrict = await executeSearch({ $text: { $search: 'duplex' }, district: 'Maitama' });
    report.combined.searchAndType = await executeSearch({ $text: { $search: 'duplex' }, type: 'sale' });
    report.combined.districtAndType = await executeSearch({ district: 'Maitama', type: 'sale' });
    report.combined.searchDistrictType = await executeSearch({ $text: { $search: 'duplex' }, district: 'Maitama', type: 'sale' });

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
audit();
