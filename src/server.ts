// src/server.ts
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';
import schemaRoutes from './routes/schemas';
import contentRoutes from './routes/content';

const app = express();

// Middleware
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CMS API is running' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/content', contentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler as any);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(env.port, () => {
      console.log(`\n✓ CMS Server running on http://localhost:${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ API health check: http://localhost:${env.port}/api/health`);
      console.log(`\n📚 Available Endpoints:`);
      console.log(`  POST   /api/auth/register        - Register new user`);
      console.log(`  POST   /api/auth/login           - Login user`);
      console.log(`  GET    /api/auth/me              - Get current user`);
      console.log(`  GET    /api/tenants             - Get tenant info`);
      console.log(`  POST   /api/schemas/:tenantId   - Create content type`);
      console.log(`  GET    /api/schemas/:tenantId   - List content types`);
      console.log(`  POST   /api/content/:tenantId/:contentTypeSlug - Create content`);
      console.log(`  GET    /api/content/:tenantId/:contentTypeSlug - List content\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

