import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const seedAdmins = async () => {
  // Load shared DB helper (CJS) dynamically and connect first
  const dbModule = (await import('./src/config/db.cjs')).default || (await import('./src/config/db.cjs'));
  const { connectDB, mongoose } = dbModule;

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB (via db.cjs)");

    // Hash the password once
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Import Admin model after mongoose is connected
    const adminMod = await import("./src/models/adminModel.js");
    const Admin = adminMod && adminMod.default ? adminMod.default : adminMod;

    const admins = [
      { email: "admin1@uni.edu", password: hashedPassword, isSuperAdmin: true },
      { email: "admin2@uni.edu", password: hashedPassword, isSuperAdmin: false },
    ];

    await Admin.deleteMany(); // Clear existing admins
    const result = await Admin.insertMany(admins);

    console.log("✅ Admin users seeded successfully:");
    result.forEach(admin => console.log(`   - ${admin.email}`));
    console.log("✅ Password for both: admin123");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding admins:", err && err.message);
    try { await mongoose.disconnect(); } catch (_) {}
  }
};

seedAdmins();