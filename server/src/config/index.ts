import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/event_tracker',
  jwtSecret: process.env.JWT_SECRET || 'gatherpulse_default_jwt_secret_dev_key',
  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  useInMemoryDb: process.env.USE_IN_MEMORY_DB || 'auto', // 'true', 'false', or 'auto'
};
