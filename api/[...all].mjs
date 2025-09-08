// Vercel Serverless Function: Mount the Express app for all /api/* routes
import app from '../backend/app.js';

export const config = {
  runtime: 'nodejs',
};

// Export a handler wrapper for Express to ensure Vercel invokes it correctly
export default function handler(req, res) {
  return app(req, res);
}
