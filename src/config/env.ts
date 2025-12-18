// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/onelio-cms',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';

