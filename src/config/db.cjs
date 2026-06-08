// Runtime BSON shim: ensure `bson` exposes helpers expected by the MongoDB driver.
// Do this before requiring mongoose so the mongodb driver picks up the patched API
try {
  const bsonModule = require('bson');
  if (bsonModule && typeof bsonModule.parseToElementsToArray !== 'function') {
    const maybeBSON = bsonModule.BSON ?? bsonModule;
    if (maybeBSON && maybeBSON.onDemand && typeof maybeBSON.onDemand.parseToElements === 'function') {
      bsonModule.parseToElementsToArray = function (bytes, offset) {
        const res = maybeBSON.onDemand.parseToElements(bytes, offset);
        return Array.isArray(res) ? res : [...res];
      };
    }
  }
} catch (e) {
  // If bson is not installed directly or cannot be required in this environment,
  // ignore — the mongodb driver will require its bundled bson module and we'll
  // still patch when mongoose loads it indirectly.
}

const mongoose = require('mongoose');

// Serverless-friendly mongoose connection with caching to reuse connections across warm invocations
const mongoCache = global.__mongoCache || (global.__mongoCache = { conn: null, promise: null });

async function connectDB() {
  if (mongoCache.conn) return mongoCache.conn;

  if (!mongoCache.promise) {
    mongoCache.promise = mongoose.connect(process.env.MONGO_URI).then((m) => {
      mongoCache.conn = m;
      return m;
    });
  }

  try {
    const conn = await mongoCache.promise;
    console.log('✅ MongoDB Connected Successfully (db.cjs)');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Failed (db.cjs):', err && err.message);
    throw err;
  }
}

module.exports = { connectDB, mongoose };
