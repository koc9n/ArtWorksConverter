import express from 'express';
import path from 'path';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Bull from 'bull';
import { config } from './config/config';
import { authRouter } from './routes/auth';
import { convertRouter } from './routes/convert';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const conversionQueue = new Bull('video-conversion', config.redis.url);

// Bull Board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(conversionQueue)],
  serverAdapter,
});

// Simple CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/shared/uploads', express.static(config.storage.uploadsDir));
app.use('/shared/converted', express.static(config.storage.convertedDir));

// Routes
app.use('/convert', convertRouter);
app.use('/auth', authRouter);
app.use('/admin/queues', serverAdapter.getRouter());

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
}); 