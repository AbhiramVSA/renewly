import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Configuration and database
import { getServerConfig, NODE_ENV } from './config/env.js';
import connectToDatabase from "./database/mongodb.js";

// Get server configuration based on environment
const serverConfig = getServerConfig();

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
    'https://renewly-app.vercel.app',  // Production frontend domain
];
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
    // Normalize: remove trailing slashes to match browser Origin header format
    .map(o => o.replace(/\/+$/, ''));
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
    console.log('[CORS] Production allowList:', allowList);
}

// Body parsing middleware
// Handles JSON payloads with reasonable size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parsing for session management
app.use(cookieParser());

// Database connection middleware - ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        res.status(503).json({
            success: false,
            message: 'Database connection unavailable',
            error: error.message
        });
    }
});

// Security middleware - rate limiting and abuse protection
// Must be applied before route handlers for effective protection
app.use(arcjetMiddleware);

// API route handlers with versioning
// All API endpoints are prefixed with /api/v1 for future compatibility

// Health check endpoints
import mongoose from 'mongoose';

// Simple ping endpoint for basic availability check
app.get('/api/v1/ping', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'SubTrack API is running'
    });
});

// Comprehensive health check endpoint
app.get('/api/v1/health', async (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: '1.0.0',
        deployment: {
            type: serverConfig.isServerless ? 'serverless' : 'traditional',
            platform: serverConfig.isServerless ? 'vercel' : 'local'
        },
        services: {
            api: {
                status: 'healthy',
                ...(serverConfig.port ? { port: serverConfig.port } : {}),
                baseUrl: serverConfig.baseUrl
            },
            database: {
                status: 'unknown',
                connected: false,
                readyState: mongoose.connection.readyState
            }
        },
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
            }
        }
    };

    try {
        // Check database connectivity
        const dbState = mongoose.connection.readyState;
        if (dbState === 1) {
            // Connected - perform a simple query to verify database is responding
            await mongoose.connection.db.admin().ping();
            healthCheck.services.database.status = 'healthy';
            healthCheck.services.database.connected = true;
        } else if (dbState === 2) {
            healthCheck.services.database.status = 'connecting';
        } else if (dbState === 0) {
            healthCheck.services.database.status = 'disconnected';
        } else {
            healthCheck.services.database.status = 'disconnecting';
        }
    } catch (error) {
        healthCheck.services.database.status = 'unhealthy';
        healthCheck.services.database.error = error.message;
        healthCheck.status = 'degraded';
    }

    // Set HTTP status based on overall health
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(healthCheck);
});

// Ready endpoint for deployment readiness checks
app.get('/api/v1/ready', async (req, res) => {
    try {
        // Check if database is connected and responding
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        
        await mongoose.connection.db.admin().ping();
        
        res.json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            message: 'SubTrack API is ready to accept requests'
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error.message,
            message: 'SubTrack API is not ready to accept requests'
        });
    }
});

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
 * Server startup logic that adapts to deployment environment
 * - Local development: Start HTTP server on specified port
 * - Serverless (Vercel): Database connection handled per-request
 * - Test environment: Skip server startup
 */
if (serverConfig.shouldListen) {
    app.listen(serverConfig.port, () => {
        console.log(`🚀 SubTrack API server started successfully`);
        console.log(`📍 Server running on: ${serverConfig.baseUrl}`);
        console.log(`📚 API Documentation: ${serverConfig.baseUrl}/`);
        console.log(`🔒 Security: Arcjet protection enabled`);
        console.log(`⚙️  Environment: ${NODE_ENV}`);
        console.log(`🔌 Database: Connection established per-request`);

        // Pre-warm database connection for local development
        connectToDatabase().catch(err => {
            console.warn('⚠️  Initial database connection failed:', err.message);
            console.log('🔄 Database will connect on first request');
        });
    });
} else {
    // In serverless environment, database connection is handled per-request via middleware
    if (serverConfig.isServerless) {
        console.log(`🚀 SubTrack API initialized for serverless deployment`);
        console.log(`☁️  Platform: Vercel Functions`);
        console.log(`⚙️  Environment: ${NODE_ENV}`);
        console.log(`🔌 Database: Connection established per-request`);
    }
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