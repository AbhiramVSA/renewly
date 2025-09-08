import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Configuration and database
import { PORT, NODE_ENV } from './config/env.js';
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

// CORS configuration - allow requests from frontend
const defaultOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
];
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
// On Vercel, also allow the deployment URL automatically if available
if (process.env.VERCEL_URL) {
    const vercelOrigin = `https://${process.env.VERCEL_URL}`;
    envOrigins.push(vercelOrigin);
}
const allowList = [...new Set([...defaultOrigins, ...envOrigins])];

const isDev = NODE_ENV !== 'production';
if (isDev) {
    // In development, reflect the request origin to allow any local host/IP and port
    app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }));
} else {
    // In production, restrict to allowList (ALLOWED_ORIGINS + VERCEL_URL)
    app.use(cors({
        origin: function(origin, callback) {
            // Allow requests with no origin (like mobile apps, curl) or if origin in allowList
            if (!origin || allowList.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }));
}

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
 * Start the Express server locally. On Vercel (serverless), export the app
 * and connect to the database without starting a listener.
 */
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 SubTrack API server started successfully`);
        console.log(`📍 Server running on: http://localhost:${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/`);
        console.log(`🔒 Security: Arcjet protection enabled`);

        // Initialize database connection after server starts
        connectToDatabase();
    });
} else if (process.env.VERCEL) {
    // In serverless environment, ensure DB is initialized on cold start
    connectToDatabase();
}

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