import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDbConnection() {
  const uri = process.env.MONGODB_URI;

  console.log('=== Database Connection Check ===');
  console.log('MONGODB_URI present:', !!uri);

  if (!uri) {
    console.log('Status: NO CONNECTION URI FOUND');
    console.log('The server will run without a database.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Status: CONNECTED to MongoDB');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    console.log('Ready state:', mongoose.connection.readyState, '(1 = connected)');
    await mongoose.disconnect();
    console.log('Disconnected successfully.');
  } catch (error: any) {
    console.log('Status: CONNECTION FAILED');
    console.log('Error:', error.message);
  }
}

checkDbConnection();
