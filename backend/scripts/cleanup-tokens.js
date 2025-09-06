#!/usr/bin/env node

/**
 * Token Cleanup Script
 * 
 * This script can be run periodically (e.g., via cron job) to clean up expired refresh tokens
 * 
 * Usage:
 *   node scripts/cleanup-tokens.js
 *   npm run cleanup-tokens
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_URI } from '../config/env.js';
import { cleanupExpiredTokens, getTokenStats } from '../utils/tokenCleanup.js';

// Load environment variables
dotenv.config();

async function main() {
    try {
        console.log('🧹 Starting token cleanup...');
        
        // Connect to database
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to database');
        
        // Get stats before cleanup
        const statsBefore = await getTokenStats();
        console.log('📊 Token stats before cleanup:', statsBefore);
        
        // Clean up expired tokens
        const result = await cleanupExpiredTokens();
        
        // Get stats after cleanup
        const statsAfter = await getTokenStats();
        console.log('📊 Token stats after cleanup:', statsAfter);
        
        console.log(`✅ Cleanup completed successfully`);
        console.log(`📈 Removed ${statsBefore.totalExpiredTokens} expired tokens from ${result.modifiedCount} users`);
        
    } catch (error) {
        console.error('❌ Token cleanup failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
main();
