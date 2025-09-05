import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'READ_ONLY', 'SERVICE'],
        default: 'USER',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true });

// Role helper methods
userSchema.methods.hasRole = function(required) {
    if (!required) return false;
    return Array.isArray(required)
        ? required.includes(this.role)
        : this.role === required;
};

userSchema.methods.isOneOf = function(roles) {
    return Array.isArray(roles) && roles.includes(this.role);
};

const User = mongoose.model('User', userSchema);

export default User;

// {name: 'Jon', email: 'jon@email.com', password: 'password' }


