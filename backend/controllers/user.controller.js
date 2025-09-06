import User from "../models/user.model.js";
import { ROLES } from "../constants/roles.js";
import { logAudit } from "../utils/auditLogger.js";
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            const error = new Error('User does not exist');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

export const changeUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !Object.values(ROLES).includes(role)) {
            const error = new Error('Invalid role');
            error.statusCode = 400;
            throw error;
        }

        // Only SUPER_ADMIN or ADMIN can change roles (restrict ADMIN from elevating to SUPER_ADMIN)
        if (!req.user || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
            const error = new Error('ADMIN cannot assign SUPER_ADMIN');
            error.statusCode = 403;
            throw error;
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            const error = new Error('Target user not found');
            error.statusCode = 404;
            throw error;
        }

        const oldRole = targetUser.role;
        targetUser.role = role;
        await targetUser.save();

        logAudit({
            actorId: req.user._id,
            action: 'ROLE_CHANGE',
            targetType: 'USER',
            targetId: targetUser._id,
            metadata: { from: oldRole, to: role },
            req
        });

        res.status(200).json({ success: true, data: { _id: targetUser._id, role: targetUser.role } });
    } catch (error) {
        next(error);
    }
}

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role = 'USER' } = req.body;

        // Only SUPER_ADMIN or ADMIN can create users
        if (!req.user || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        // ADMIN cannot create SUPER_ADMIN
        if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
            const error = new Error('ADMIN cannot create SUPER_ADMIN');
            error.statusCode = 403;
            throw error;
        }

        if (!Object.values(ROLES).includes(role)) {
            const error = new Error('Invalid role');
            error.statusCode = 400;
            throw error;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role });

        logAudit({
            actorId: req.user._id,
            action: 'CREATE_USER',
            targetType: 'USER',
            targetId: newUser._id,
            metadata: { email: newUser.email, role: newUser.role },
            req
        });

        res.status(201).json({ 
            success: true, 
            data: { 
                _id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role,
                isActive: newUser.isActive 
            } 
        });
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, isActive } = req.body;

        // Users can update themselves, or elevated roles can update others
        const isSelf = req.user._id.toString() === id;
        const isElevated = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role);

        if (!isSelf && !isElevated) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (email !== undefined) updateFields.email = email;
        if (isActive !== undefined && isElevated) updateFields.isActive = isActive; // Only elevated can change active status

        Object.assign(user, updateFields);
        await user.save();

        logAudit({
            actorId: req.user._id,
            action: 'UPDATE_USER',
            targetType: 'USER',
            targetId: user._id,
            metadata: { updatedFields: Object.keys(updateFields) },
            req
        });

        res.status(200).json({ 
            success: true, 
            data: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isActive: user.isActive 
            } 
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Only SUPER_ADMIN can delete users
        if (!req.user || req.user.role !== ROLES.SUPER_ADMIN) {
            const error = new Error('Forbidden: Only SUPER_ADMIN can delete users');
            error.statusCode = 403;
            throw error;
        }

        // Cannot delete self
        if (req.user._id.toString() === id) {
            const error = new Error('Cannot delete yourself');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        await user.deleteOne();

        logAudit({
            actorId: req.user._id,
            action: 'DELETE_USER',
            targetType: 'USER',
            targetId: user._id,
            metadata: { email: user.email, role: user.role },
            req
        });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
}