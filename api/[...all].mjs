// Vercel Serverless Function: Mount the Express app for all /api/* routes
import app from '../backend/app.js';

export const config = {
  runtime: 'nodejs',
};

export default app;
