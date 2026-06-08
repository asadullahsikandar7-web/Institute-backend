require('dotenv').config();
const dbModule = require('./src/config/db.cjs');
const bcrypt = require('bcryptjs');

async function setStudentPasswords() {
  try {
    await dbModule.connectDB();
    const mongoose = dbModule.mongoose;
    const students = await mongoose.connection.db.collection('students').find().toArray();
    console.log(`\nFound ${students.length} students to update passwords\n`);

    for (const student of students) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      await mongoose.connection.db.collection('students').updateOne(
        { _id: student._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Password set for: ${student.rollNo} (${student.name})`);
    }

    console.log(`\n✅ All ${students.length} student passwords have been set!`);
    console.log(`   Password for all students: 1234\n`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err && err.message);
  }
}

setStudentPasswords();
