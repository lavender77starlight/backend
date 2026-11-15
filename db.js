const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('lunar_game');
    console.log('Connected to MongoDB Atlas successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

connectDB();

function getDB() {
  if (!db) {
    throw new Error('Database not initialized! Call connectDB first.');
  }
  return db;
}

module.exports = { getDB };