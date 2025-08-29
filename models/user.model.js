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
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;

// {name: 'Jon', email: 'jon@email.com', password: 'password' }


