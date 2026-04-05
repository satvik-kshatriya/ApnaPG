import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PropertySchema = new mongoose.Schema({
  occupancy_type: String,
  title: String,
});

const Property = mongoose.model('Property', PropertySchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apnapg');
    console.log('Connected to DB');
    const properties = await Property.find({}, 'title occupancy_type');
    console.log('Properties in DB:');
    properties.forEach(p => {
      console.log(`- ${p.title}: [${p.occupancy_type}]`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
