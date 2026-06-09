const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    isConnected = conn.connections[0].readyState === 1;

    console.log("✅ MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };