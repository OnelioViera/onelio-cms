// src/config/database.ts
import mongoose, { Connection } from 'mongoose';
import { env, isDevelopment } from './env';

let connection: Connection | null = null;

export const connectDatabase = async (): Promise<Connection> => {
  if (connection) {
    console.log('Using existing database connection');
    return connection;
  }

  try {
    const mongoose_connection = await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    connection = mongoose_connection.connection;
    console.log(`✓ MongoDB connected`);
    
    if (isDevelopment) {
      connection.on('disconnected', () => {
        console.warn('⚠ MongoDB disconnected');
      });
      
      connection.on('error', (err) => {
        console.error('✗ MongoDB connection error:', err);
      });
    }

    return connection;
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
    console.log('✓ MongoDB disconnected');
  }
};

export const getDatabase = (): Connection => {
  if (!connection) {
    throw new Error('Database not connected. Call connectDatabase first.');
  }
  return connection;
};

