const dbModule = require('./src/config/db.cjs');
require('dotenv').config();

async function run(){
  try{
    await dbModule.connectDB();
    const Student = require('./src/models/studentModel.js');
    const s = await Student.findOne({ rollNo: 'CS-201' }).lean();
    console.log('Student doc:', s);
    await dbModule.mongoose.disconnect();
  }catch(e){
    console.error('Error:', e && e.message);
  }
}
run();
