import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.MONGODB_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ ERROR: MONGODB_URI is not set in .env file');
    process.exit(1);
  }

  console.log('📍 Connection String (password hidden):', mongoUri.replace(/:[^:]*@/, ':***@'));
  console.log('');

  try {
    console.log('⏳ Attempting to connect...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log('📊 Connection Details:');
    console.log(`   - Host: ${mongoose.connection.host}`);
    console.log(`   - Database: ${mongoose.connection.name}`);
    console.log(`   - Ready State: ${mongoose.connection.readyState} (1 = connected)`);
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Connection Failed!\n');
    console.error('Error Message:', error.message);
    console.error('\nTroubleshooting Steps:');
    console.error('1. Check your MongoDB password is correct');
    console.error('2. Verify special characters are URL encoded');
    console.error('3. Add your IP to MongoDB Atlas Network Access');
    console.error('4. Check your internet connection');
    console.error('5. Verify the cluster name is correct\n');
    process.exit(1);
  }
}

testDatabaseConnection();
