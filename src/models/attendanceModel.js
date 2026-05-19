const mongoose=require ("mongoose");

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  date: String,
  status: String, // present | absent | leave
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
