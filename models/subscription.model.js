import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    
    // Service Information
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        minLength: [2, 'Subscription name must be at least 2 characters'],
        maxLength: [100, 'Subscription name cannot exceed 100 characters'],
    },
    
    // Financial Information
    price: {
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Subscription price cannot be negative'],
        validate: {
            validator: function(value) {
                // Ensure price has maximum 2 decimal places
                return Number.isFinite(value) && value >= 0 && 
                       Math.round(value * 100) === value * 100;
            },
            message: 'Price must be a valid monetary amount with up to 2 decimal places'
        }
    },
    
    currency: {
        type: String,
        enum: {
            values: ['USD', 'EUR', 'INR'],
            message: 'Currency must be one of: USD, EUR, INR'
        },
        default: 'INR',
        uppercase: true // Automatically convert to uppercase
    },
    
    // Billing and Renewal Information
    frequency: {
        type: String,
        enum: {
            values: ['daily', 'weekly', 'monthly', 'yearly'],
            message: 'Frequency must be one of: daily, weekly, monthly, yearly'
        },
        required: [true, 'Billing frequency is required'],
        lowercase: true // Automatically convert to lowercase
    },
    
    // Categorization for Analytics and Organization
    category: {
        type: String,
        enum: {
            values: ['sports', 'news', 'entertainment', 'technology', 'education', 
                    'lifestyle', 'finance', 'political', 'other'],
            message: 'Invalid category selection'
        },
        required: [true, 'Subscription category is required'],
        lowercase: true
        // Index defined in compound index below for better performance
    },
    
    // Payment Information
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        trim: true,
        maxLength: [50, 'Payment method description cannot exceed 50 characters']
        // Examples: "Credit Card", "PayPal", "Bank Transfer", etc.
    },
    
    // Subscription Status Management
    status: {
        type: String,
        enum: {
            values: ['active', 'cancelled', 'expired'],
            message: 'Status must be one of: active, cancelled, expired'
        },
        default: 'active',
        lowercase: true
        // Index defined in compound indexes below for better performance
    },
    
    // Date Management
    startDate: {
        type: Date,
        required: [true, 'Subscription start date is required'],
        validate: {
            validator: function(value) {
                // Allow current date and past dates, but not future dates beyond today
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today
                return value <= today;
            },
            message: 'Start date cannot be in the future'
        }
        // Individual index not needed since we have compound indexes with other fields
    },
    
    renewalDate: {
        type: Date,
        required: false, // Will be auto-calculated if not provided
        validate: {
            validator: function(value) {
                if (!value) return true; // Optional field
                return value > this.startDate;
            },
            message: 'Renewal date must be after the start date'
        }
        // Index defined in compound index below for better performance
    },
    
    // User Association
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User association is required']
        // Index defined in compound index below for better performance
    }

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'subscriptions' // Explicit collection name
});

/**
 * Pre-save Middleware
 * Automatically calculates renewal date based on start date and frequency
 */
subscriptionSchema.pre('save', function(next) {
    // Only calculate renewal date if it's not already set
    if (!this.renewalDate && this.startDate && this.frequency) {
        
        // Define renewal periods in days
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,    // Approximate month
            yearly: 365     // Approximate year
        };
        
        // Calculate renewal date
        this.renewalDate = new Date(this.startDate);
        const daysToAdd = renewalPeriods[this.frequency];
        
        if (daysToAdd) {
            this.renewalDate.setDate(this.renewalDate.getDate() + daysToAdd);
        }
    }
    
    next();
});

/**
 * Instance Methods
 * These methods are available on individual subscription documents
 */

/**
 * Check if subscription is due for renewal within specified days
 * @param {number} days - Number of days to check ahead (default: 7)
 * @returns {boolean} True if renewal is due within the specified period
 */
subscriptionSchema.methods.isDueForRenewal = function(days = 7) {
    if (!this.renewalDate || this.status !== 'active') return false;
    
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + days);
    
    return this.renewalDate <= checkDate;
};

/**
 * Calculate the total cost per year for this subscription
 * @returns {number} Annual cost in the subscription's currency
 */
subscriptionSchema.methods.getAnnualCost = function() {
    const multipliers = {
        daily: 365,
        weekly: 52,
        monthly: 12,
        yearly: 1
    };
    
    return this.price * (multipliers[this.frequency] || 0);
};

/**
 * Get next renewal date after the current renewal date
 * @returns {Date} Next renewal date
 */
subscriptionSchema.methods.getNextRenewalDate = function() {
    if (!this.renewalDate) return null;
    
    const renewalPeriods = {
        daily: 1,
        weekly: 7,
        monthly: 30,
        yearly: 365
    };
    
    const nextRenewal = new Date(this.renewalDate);
    const daysToAdd = renewalPeriods[this.frequency];
    
    if (daysToAdd) {
        nextRenewal.setDate(nextRenewal.getDate() + daysToAdd);
    }
    
    return nextRenewal;
};

/**
 * Indexes for Performance Optimization
 */

// Compound index for user subscription queries
subscriptionSchema.index({ user: 1, status: 1 });

// Compound index for renewal tracking
subscriptionSchema.index({ renewalDate: 1, status: 1 });

// Compound index for category analytics
subscriptionSchema.index({ category: 1, status: 1 });

/**
 * Model Export
 * Creates and exports the Subscription model for use throughout the application
 */
const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

