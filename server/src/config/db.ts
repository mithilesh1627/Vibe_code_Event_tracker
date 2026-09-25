import mongoose from 'mongoose';
import { config } from './index.js';

let mongodInstance: any = null;

export const connectDatabase = async (): Promise<string> => {
  // If explicitly requested to use in-memory database
  if (config.useInMemoryDb === 'true') {
    return await connectInMemory();
  }

  // Attempt connection to the configured MongoDB URI with a suitable timeout for cloud Atlas
  try {
    const sanitizedUri = config.mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${sanitizedUri}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('MongoDB connected successfully via URI.');
    return config.mongoUri;
  } catch (err: any) {
    if (config.useInMemoryDb === 'auto') {
      console.warn(`Could not connect to external MongoDB (${err.message}).`);
      console.log('Falling back to built-in In-Memory MongoDB for zero-configuration demo/viva support...');
      return await connectInMemory();
    }
    throw err;
  }
};

const connectInMemory = async (): Promise<string> => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`In-memory MongoDB started and connected at: ${uri}`);
    return uri;
  } catch (memErr: any) {
    console.error('Failed to initialize in-memory MongoDB:', memErr.message);
    throw memErr;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
