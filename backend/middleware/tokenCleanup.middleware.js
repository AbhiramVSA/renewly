import { cleanupUserExpiredTokens } from '../utils/tokenCleanup.js';

/**
 * Middleware to optionally clean up expired refresh tokens for the authenticated user
 * This runs after authentication but before the main controller logic
 */

export const cleanupExpiredTokensMiddleware = async (req, res, next) => {
    try {
        // Only run if user is authenticated
        if (req.user && req.user._id) {
            // Clean up expired tokens in the background (don't block the request)
            cleanupUserExpiredTokens(req.user._id).catch(error => {
                console.error('Background token cleanup failed:', error);
            });
        }
        next();
    } catch (error) {
        // Don't let token cleanup errors affect the main request
        console.error('Token cleanup middleware error:', error);
        next();
    }
};
