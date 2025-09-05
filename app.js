import express from "express";
import cookieParser from "cookie-parser";

// Configuration and database
import { PORT } from './config/env.js';
import connectToDatabase from "./database/mongodb.js";

// Route handlers
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';

// Middleware stack
import errorMiddleware from "./middleware/error.middleware.js";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

// Initialize Express application
const app = express();

// Body parsing middleware
// Handles JSON payloads with reasonable size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parsing for session management
app.use(cookieParser());

// Security middleware - rate limiting and abuse protection
// Must be applied before route handlers for effective protection
app.use(arcjetMiddleware);

// API route handlers with versioning
// All API endpoints are prefixed with /api/v1 for future compatibility
app.use('/api/v1/auth', authRouter);        // Authentication and session management
app.use('/api/v1/user', userRouter);        // User management and profiles
app.use('/api/v1/subscriptions', subscriptionRouter);  // Subscription CRUD operations

// Global error handling middleware
// Must be the last middleware to catch all unhandled errors
app.use(errorMiddleware);

/**
 * Health check and API information endpoint
 * Provides basic API status and available endpoints
 */
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to SubTrack API!",
        version: "1.0.0",
        status: "healthy",
        documentation: {
            auth: "/api/v1/auth - Authentication endpoints",
            users: "/api/v1/user - User management",
            subscriptions: "/api/v1/subscriptions - Subscription management"
        },
        features: [
            "JWT Authentication with Refresh Tokens",
            "Role-Based Access Control (RBAC)",
            "Comprehensive Audit Logging",
            "Rate Limiting & Security Protection",
            "RESTful API Design"
        ]
    });
});

/**
 * Start the Express server and initialize database connection
 * Graceful startup with proper error handling
 */
app.listen(PORT, () => {
    console.log(`🚀 SubTrack API server started successfully`);
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`🔒 Security: Arcjet protection enabled`);
    
    // Initialize database connection after server starts
    connectToDatabase();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('💤 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('💤 SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;