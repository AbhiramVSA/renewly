/**
 * Authentication Routes
 * 
 * Handles user authentication and session management endpoints.
 * Includes sign up, sign in, token refresh, and sign out functionality
 * with comprehensive JWT and refresh token management.
 * 
 * @author AbhiramVSA
 * @version 1.0.0
 */

import { Router } from 'express';
import { signUp, signIn, signOut, refreshToken, signOutAll } from "../controllers/auth.controller.js";
import authorize from '../middleware/auth.middleware.js';

const authRouter = Router();

/**
 * POST /sign-up - User Registration
 * Access: Public
 * Creates new user account with email/password
 * Returns JWT access token and refresh token
 * Automatically assigns USER role to new accounts
 */
authRouter.post('/sign-up', signUp);

/**
 * POST /sign-in - User Authentication
 * Access: Public
 * Authenticates user with email/password credentials
 * Returns JWT access token and refresh token
 * Includes audit logging for login events
 */
authRouter.post('/sign-in', signIn);

/**
 * POST /refresh - Token Refresh
 * Access: Public (requires valid refresh token)
 * Exchanges refresh token for new access/refresh token pair
 * Implements token rotation for enhanced security
 * Validates refresh token expiry and user status
 */
authRouter.post('/refresh', refreshToken);

/**
 * POST /sign-out - Single Device Sign Out
 * Access: Public (optional refresh token)
 * Invalidates specific refresh token for current device
 * Can be called with or without authentication
 */
authRouter.post('/sign-out', signOut);

/**
 * POST /sign-out-all - Multi-Device Sign Out
 * Access: Authenticated users only
 * Invalidates all refresh tokens for the user
 * Forces sign out from all devices/sessions
 * Requires valid JWT token for user identification
 */
authRouter.post('/sign-out-all', authorize, signOutAll);

export default authRouter;