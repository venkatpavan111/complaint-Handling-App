const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedFunction = require('../seedFunction');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_complaint_db', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to local MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log(`[MongoDB] Local MongoDB not running (${error.message}). Starting In-Memory MongoDB Server...`);
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB Memory Server] Connected successfully: ${conn.connection.host}`);
      await seedFunction();
    } catch (memErr) {
      console.error(`[MongoDB Memory Server Error] ${memErr.message}`);
    }
  }
};

module.exports = connectDB;
