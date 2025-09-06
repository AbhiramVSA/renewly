import mongoose from 'mongoose';
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import {JWT_EXPIRES_IN, JWT_SECRET, JWT_REFRESH_EXPIRES_IN} from "../config/env.js";
import jwt from 'jsonwebtoken';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {name, email, password} = req.body;
        // check if the user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session });

        const token = jwt.sign({ userId: newUsers[0].id}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        // Generate refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresAt = new Date(Date.now() + (JWT_REFRESH_EXPIRES_IN ? parseInt(JWT_REFRESH_EXPIRES_IN) : 7 * 24 * 60 * 60 * 1000)); // 7 days default
        
        // Save refresh token to user
        newUsers[0].refreshTokens.push({
            token: refreshToken,
            expiresAt: refreshExpiresAt
        });
        await newUsers[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User successfully created',
            data: {
                token,
                refreshToken,
                user: newUsers[0],
            }
        })

    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne( {email} );
        if (!user) {
            const error = new Error('User does not exist');
            error.statusCode = 404;
            return next(error);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            return next(error);
        }

        const token = jwt.sign( {userId: user._id}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        // Generate refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresAt = new Date(Date.now() + (JWT_REFRESH_EXPIRES_IN ? parseInt(JWT_REFRESH_EXPIRES_IN) : 7 * 24 * 60 * 60 * 1000)); // 7 days default
        
        // Clean expired tokens and add new one
        user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: refreshExpiresAt
        });
        await user.save();

        // Audit login
        logAudit({
            actorId: user._id,
            action: 'LOGIN',
            targetType: 'USER',
            targetId: user._id,
            metadata: { email: user.email },
            req
        });

        res.status(200).json({
            success: true,
            message: 'Sign in successful',
            data: {
                token,
                refreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch(error) {
        next(error);
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            const error = new Error('Refresh token is required');
            error.statusCode = 400;
            return next(error);
        }

        // Find user with this refresh token
        const user = await User.findOne({ 
            'refreshTokens.token': refreshToken,
            'refreshTokens.expiresAt': { $gt: new Date() }
        });

        if (!user) {
            const error = new Error('Invalid or expired refresh token');
            error.statusCode = 401;
            return next(error);
        }

        // Check if user is active
        if (!user.isActive) {
            const error = new Error('Account is deactivated');
            error.statusCode = 403;
            return next(error);
        }

        // Generate new access token
        const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        // Generate new refresh token and remove the old one
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresAt = new Date(Date.now() + (JWT_REFRESH_EXPIRES_IN ? parseInt(JWT_REFRESH_EXPIRES_IN) : 7 * 24 * 60 * 60 * 1000));
        
        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        user.refreshTokens.push({
            token: newRefreshToken,
            expiresAt: refreshExpiresAt
        });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?._id;

        if (userId) {
            const user = await User.findById(userId);
            if (user && refreshToken) {
                // Remove the specific refresh token
                user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
                await user.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Sign out successful'
        });
    } catch (error) {
        next(error);
    }
};

export const signOutAll = async (req, res, next) => {
    try {
        const userId = req.user?._id;

        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                // Remove all refresh tokens
                user.refreshTokens = [];
                await user.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Signed out from all devices'
        });
    } catch (error) {
        next(error);
    }
};

