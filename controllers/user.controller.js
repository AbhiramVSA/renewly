import User from "../models/user.model.js";
import { ROLES } from "../constants/roles.js";
import { logAudit } from "../utils/auditLogger.js";

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
            error.status = 404;
            throw next(error);
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
            error.status = 400;
            throw error;
        }

        // Only SUPER_ADMIN or ADMIN can change roles (restrict ADMIN from elevating to SUPER_ADMIN)
        if (!req.user || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.status = 403;
            throw error;
        }

        if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
            const error = new Error('ADMIN cannot assign SUPER_ADMIN');
            error.status = 403;
            throw error;
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            const error = new Error('Target user not found');
            error.status = 404;
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