// Vercel Serverless Function: Mount the Express app for all /api/* routes
import app from '../backend/app.js';

export const config = {
  runtime: 'nodejs',
};

// Export a handler wrapper for Express to ensure Vercel invokes it correctly
export default function handler(req, res) {
  // Some platforms may strip the '/api' prefix before invoking the function.
  // Ensure Express sees paths starting with '/api/...'.
  try {
    const originalUrl = req.url || '';
  const originalMethod = req.method || 'UNKNOWN';
    if (originalUrl && !originalUrl.startsWith('/api/')) {
      req.url = `/api${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
    }
  // Log mapping for debugging on Vercel functions
  console.log(`[fn] ${originalMethod} ${originalUrl} -> ${req.url}`);
  } catch (_) {
    // no-op; continue with original URL if mutation fails
  }
  return app(req, res);
}
