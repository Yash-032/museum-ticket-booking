import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let isConnected = false;
let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectToDatabase(): Promise<void> {
  // If already connected, don't connect again
  if (isConnected) {
    console.log('MongoDB connection already established');
    return;
  }

  try {
    // Get MongoDB connection string from environment variable
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/museum-ticket-booking';
    
    try {
      // Try to connect to the real MongoDB first
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      });
      
      isConnected = true;
      console.log('Connected to real MongoDB successfully');
    } catch (error) {
      console.error('Error connecting to real MongoDB:', error);
      console.log('Falling back to in-memory MongoDB...');
      
      // Create in-memory MongoDB server as fallback
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(mongoUri);
      isConnected = true;
      console.log('Connected to in-memory MongoDB successfully');
    }
  } catch (error) {
    console.error('Failed to connect to any MongoDB instance:', error);
    console.log('Continuing without MongoDB connection. Some features may not work correctly.');
  }
}

export function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return Promise.resolve();
  }
  
  return mongoose.disconnect()
    .then(async () => {
      isConnected = false;
      console.log('MongoDB disconnected');
      
      // Stop in-memory server if it was used
      if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
        mongoMemoryServer = null;
        console.log('In-memory MongoDB server stopped');
      }
    })
    .catch(error => {
      console.error('Error disconnecting from MongoDB:', error);
      // Don't throw the error, just log it
      return Promise.resolve();
    });
}