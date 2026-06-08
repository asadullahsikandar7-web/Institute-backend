const dbModule = require('./src/config/db.cjs');
require('dotenv').config();

async function run(){
  try{
    await dbModule.connectDB();
    const doc = await dbModule.mongoose.connection.db.collection('students').findOne({ rollNo: 'CS-201' });
    console.log('student doc raw:', doc);
    await dbModule.mongoose.disconnect();
  }catch(e){
    console.error('error', e && e.message);
  }
}

run();
