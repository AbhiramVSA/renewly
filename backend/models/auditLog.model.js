import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    
    // Actor Information - Who performed the action
    actor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Actor (user performing action) is required']
        // Index defined in compound index below for better performance
    },
    
    // Action Classification - What was done
    action: { 
        type: String, 
        required: [true, 'Action type is required'],
        enum: {
            values: [
                // Authentication Events
                'LOGIN',
                'TOKEN_REFRESH',
                
                // Subscription Management
                'CREATE_SUBSCRIPTION',
                'UPDATE_SUBSCRIPTION',
                'DELETE_SUBSCRIPTION',
                'CANCEL_SUBSCRIPTION',
                
                // User Management
                'ROLE_CHANGE',
                'CREATE_USER',
                'UPDATE_USER',
                'DELETE_USER',
                
                // System Events (for future use)
                'SYSTEM_CONFIG_CHANGE',
                'BACKUP_CREATED',
                'DATA_EXPORT'
            ],
            message: 'Invalid audit action type'
        },
        uppercase: true // Ensure consistent formatting
        // Index defined in compound index below for better performance
    },
    
    // Target Information - What was affected
    targetType: { 
        type: String, 
        required: [true, 'Target type is required'],
        enum: {
            values: ['USER', 'SUBSCRIPTION', 'SYSTEM'],
            message: 'Target type must be USER, SUBSCRIPTION, or SYSTEM'
        },
        uppercase: true
        // Index defined in compound index below for better performance
    },
    
    targetId: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null
        // Can be ObjectId for USER/SUBSCRIPTION targets, or string for SYSTEM targets
        // Index defined in compound index below for better performance
    },
    
    // Network and Client Information for Forensics
    ip: { 
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true; // IP is optional
                // Basic IP validation (IPv4 and IPv6)
                const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
                const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
                return ipv4Regex.test(v) || ipv6Regex.test(v) || v === '::1' || v === '127.0.0.1';
            },
            message: 'Invalid IP address format'
        }
    },
    
    userAgent: { 
        type: String,
        maxLength: [500, 'User agent string cannot exceed 500 characters']
        // Stores browser/client information for security analysis
    },
    
    // Flexible Metadata Storage
    metadata: { 
        type: mongoose.Schema.Types.Mixed,
        // Stores action-specific context information:
        // - For LOGIN: { email, success: true/false, failureReason }
        // - For ROLE_CHANGE: { oldRole, newRole, targetUserId }
        // - For SUBSCRIPTION_*: { subscriptionName, amount, currency }
        // - For USER_*: { targetEmail, changedFields }
    },
    
    // Immutable Timestamp
    createdAt: { 
        type: Date, 
        default: Date.now, 
        immutable: true // Prevents modification after creation
        // Index defined in compound indexes below for better performance
    }
    
}, { 
    versionKey: false, // Disable __v field since audit logs are immutable
    collection: 'auditLogs' // Explicit collection name
});


auditLogSchema.pre('findOneAndUpdate', function() {
    throw new Error('Security violation: Audit logs are append-only and cannot be modified');
});

auditLogSchema.pre('updateOne', function() {
    throw new Error('Security violation: Audit logs are append-only and cannot be modified');
});

auditLogSchema.pre('updateMany', function() {
    throw new Error('Security violation: Audit logs are append-only and cannot be modified');
});

auditLogSchema.pre('deleteOne', function() {
    throw new Error('Security violation: Audit logs cannot be deleted');
});

auditLogSchema.pre('deleteMany', function() {
    throw new Error('Security violation: Audit logs cannot be deleted');
});

auditLogSchema.pre('remove', function() {
    throw new Error('Security violation: Audit logs cannot be deleted');
});

auditLogSchema.pre('findOneAndDelete', function() {
    throw new Error('Security violation: Audit logs cannot be deleted');
});


auditLogSchema.statics.getLogsForUser = function(userId, options = {}) {
    return this.find({ actor: userId })
        .sort({ createdAt: -1 })
        .limit(options.limit || 100)
        .skip(options.skip || 0)
        .populate('actor', 'name email role');
};

/**
 * Get audit logs for a specific action type
 * @param {string} action - Action type to filter by
 * @param {Object} options - Query options
 * @returns {Promise} Query promise
 */
auditLogSchema.statics.getLogsByAction = function(action, options = {}) {
    return this.find({ action: action.toUpperCase() })
        .sort({ createdAt: -1 })
        .limit(options.limit || 100)
        .skip(options.skip || 0)
        .populate('actor', 'name email role');
};

/**
 * Get recent audit logs with optional filtering
 * @param {Object} filter - Additional filter criteria
 * @param {Object} options - Query options
 * @returns {Promise} Query promise
 */
auditLogSchema.statics.getRecentLogs = function(filter = {}, options = {}) {
    return this.find(filter)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0)
        .populate('actor', 'name email role');
};

/**
 * Performance Indexes
 * Optimized for common audit log query patterns
 */

// Compound index for user-specific audits
auditLogSchema.index({ actor: 1, createdAt: -1 });

// Compound index for action-based queries
auditLogSchema.index({ action: 1, createdAt: -1 });

// Compound index for target-based queries
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

// Index for date range queries (useful for reporting)
auditLogSchema.index({ createdAt: -1 });

/**
 * Model Export
 * Creates and exports the AuditLog model with security enforcement
 */
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
