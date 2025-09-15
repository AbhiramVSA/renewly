import mongoose from 'mongoose';

import {DB_URI, NODE_ENV} from "../config/env.js";

// Track connection state
let isConnecting = false;
let isConnected = false;

const connectToDatabase = async () => {
    // If already connected, return immediately
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    // If currently connecting, wait for it to complete
    if (isConnecting) {
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }

    try {
        if(!DB_URI) {
            throw new Error("MongoDB URI is missing");
        }

        isConnecting = true;

        // Connection options optimized for both local and serverless
        const options = {
            // Connection timeouts
            serverSelectionTimeoutMS: 5000, // 5 seconds
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            // Connection pooling
            maxPoolSize: process.env.VERCEL ? 1 : 10, // Smaller pool for serverless
            minPoolSize: 0,
            maxIdleTimeMS: 10000, // Close idle connections after 10s
        };

        await mongoose.connect(DB_URI, options);
        isConnected = true;
        console.log(`✅ Connected to Database in ${NODE_ENV} mode`);
        console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
        console.log(`🔧 Buffer commands: ${options.bufferCommands}`);
    } catch(error) {
        isConnected = false;
        console.error('❌ Cannot connect to database:', error.message);
        console.error('🔍 DB_URI exists:', !!DB_URI);
        console.error('🔍 DB_URI starts with mongodb:', DB_URI?.startsWith('mongodb'));
        // Re-throw error so calling code can handle it
        throw error;
    } finally {
        isConnecting = false;
    }

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
        console.log('📡 Database disconnected');
        isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
        console.error('📡 Database connection error:', error);
        isConnected = false;
    });
}

export default connectToDatabase;