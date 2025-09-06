/**
 * User Model
 * 
 * Defines the user schema for authentication, authorization, and profile management.
 * Includes role-based access control, refresh token management, and security features.
 * 
 * Key Features:
 * - Secure password storage (hashed via bcrypt in controllers)
 * - Role-based permission system with 6 levels
 * - Refresh token storage for enhanced authentication
 * - Account activation/deactivation support
 * - Email validation and uniqueness enforcement
 * 
 * @author AbhiramVSA
 * @version 1.0.0
 */

import mongoose from 'mongoose';

/**
 * User Schema Definition
 * Represents a user in the SubTrack system with authentication and authorization data
 */
const userSchema = new mongoose.Schema({
    
    // Personal Information
    name: {
        type: String,
        required: [true, 'Name is required for user registration'],
        trim: true,
        minLength: [2, 'Name must be at least 2 characters long'],
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    
    // Authentication Credentials
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        trim: true,
        lowercase: true, // Automatically convert to lowercase for consistency
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
        // Index defined in compound index below for better performance
    },
    
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters long'],
        // Note: Password is hashed using bcrypt before saving (handled in controllers)
    },
    
    // Authorization and Access Control
    role: {
        type: String,
        enum: {
            values: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'READ_ONLY', 'SERVICE'],
            message: 'Invalid role. Must be one of: SUPER_ADMIN, ADMIN, MANAGER, USER, READ_ONLY, SERVICE'
        },
        default: 'USER' // New users get standard access by default
        // Index defined in compound index below for better performance
    },
    
    // Account Status Management
    isActive: {
        type: Boolean,
        default: true
        // Index defined in compound indexes below for better performance
        // When false, user cannot authenticate even with valid credentials
    },
    
    // Refresh Token Management for Enhanced Security
    refreshTokens: [{
        token: { 
            type: String, 
            required: true 
        },
        expiresAt: { 
            type: Date, 
            required: true
            // Index defined separately below for better control
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
        // Multiple tokens allow users to be logged in on multiple devices
        // Tokens are automatically cleaned up when expired
    }]
    
}, { 
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: 'users' // Explicit collection name for clarity
});

/**
 * Instance Methods
 * These methods are available on individual user documents
 */

/**
 * Check if user has a specific role or one of multiple roles
 * @param {string|string[]} required - Single role string or array of roles
 * @returns {boolean} True if user has the required role(s)
 * 
 * @example
 * user.hasRole('ADMIN') // Check for specific role
 * user.hasRole(['ADMIN', 'SUPER_ADMIN']) // Check for any of multiple roles
 */
userSchema.methods.hasRole = function(required) {
    if (!required) return false;
    
    return Array.isArray(required)
        ? required.includes(this.role)
        : this.role === required;
};

/**
 * Check if user has one of the specified roles
 * @param {string[]} roles - Array of roles to check against
 * @returns {boolean} True if user has any of the specified roles
 * 
 * @example
 * user.isOneOf(['ADMIN', 'MANAGER']) // Check if user is admin or manager
 */
userSchema.methods.isOneOf = function(roles) {
    return Array.isArray(roles) && roles.includes(this.role);
};

/**
 * Check if user can perform administrative actions
 * @returns {boolean} True if user has administrative privileges
 */
userSchema.methods.isAdmin = function() {
    return this.hasRole(['SUPER_ADMIN', 'ADMIN']);
};

/**
 * Get user's permission level as a number (higher = more permissions)
 * @returns {number} Permission level (0-5)
 */
userSchema.methods.getPermissionLevel = function() {
    const levels = {
        'SERVICE': 0,
        'READ_ONLY': 1,
        'USER': 2,
        'MANAGER': 3,
        'ADMIN': 4,
        'SUPER_ADMIN': 5
    };
    return levels[this.role] || 0;
};

/**
 * Indexes for Performance Optimization
 */

// Compound index for authentication queries
userSchema.index({ email: 1, isActive: 1 });

// Compound index for role-based queries
userSchema.index({ role: 1, isActive: 1 });

// Index for refresh token cleanup operations
userSchema.index({ 'refreshTokens.expiresAt': 1 });

/**
 * Model Export
 * Creates and exports the User model for use throughout the application
 */
const User = mongoose.model('User', userSchema);

export default User;


