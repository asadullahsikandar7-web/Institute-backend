const mongoose = require('mongoose');
require('dotenv').config();

(async function(){
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';
  try{
    const dbModule = require('./src/config/db.cjs');
    await dbModule.connectDB();
    console.log('Connected for seeding (via db.cjs)');
    const seeder = await import('./src/utils/autoSeed.js');
    const res = await seeder.default();
    console.log('Seeding complete:', res);
    await dbModule.mongoose.disconnect();
    process.exit(0);
  }catch(e){
    console.error('Seeding failed:', e && e.message);
    process.exit(1);
  }
})();
