require('dotenv').config();
const dbModule = require('./src/config/db.cjs');

async function checkDb() {
  try {
    await dbModule.connectDB();
    const mongoose = dbModule.mongoose;
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`\n📊 Database Stats:\n`);

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  📁 ${col.name}: ${count} documents`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err && err.message);
  }
}

checkDb();
