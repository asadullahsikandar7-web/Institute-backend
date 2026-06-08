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
