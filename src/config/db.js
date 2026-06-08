import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dbModule = require('./db.cjs');

export default dbModule.connectDB;