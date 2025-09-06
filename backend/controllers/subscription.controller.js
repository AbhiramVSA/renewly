import Subscription from '../models/subscription.model.js';
import { logAudit } from '../utils/auditLogger.js';


export const createSubscription = async (req, res, next) => {
    
    try {
        // Normalize input to reduce validation errors
        // Allowed enums (mirror schema)
        const CURRENCIES = new Set(['USD','EUR','INR']);
        const FREQUENCIES = new Set(['daily','weekly','monthly','yearly']);
        const CATEGORIES = new Set(['sports','news','entertainment','technology','education','lifestyle','finance','political','other']);

        const rawName = req.body?.name?.trim();
        const rawPrice = typeof req.body?.price === 'string' ? Number(req.body.price) : req.body?.price;
        const rawCurrency = req.body?.currency?.toUpperCase();
        const rawFrequency = req.body?.frequency?.toLowerCase();
        const rawCategory = req.body?.category?.toLowerCase();
        const rawPaymentMethod = req.body?.paymentMethod?.trim();
        const rawStartDate = req.body?.startDate ? new Date(req.body.startDate) : undefined;
        const rawRenewalDate = req.body?.renewalDate ? new Date(req.body.renewalDate) : undefined;

        // Basic required checks to provide clearer messages than generic validation
        if (!rawName) {
            const err = new Error('Subscription name is required');
            err.statusCode = 400;
            throw err;
        }
        if (rawPrice === undefined || Number.isNaN(rawPrice)) {
            const err = new Error('Valid price is required');
            err.statusCode = 400;
            throw err;
        }
        if (!rawFrequency) {
            const err = new Error('Frequency is required');
            err.statusCode = 400;
            throw err;
        }
        if (!rawCategory) {
            const err = new Error('Category is required');
            err.statusCode = 400;
            throw err;
        }
        if (!rawPaymentMethod) {
            const err = new Error('Payment method is required');
            err.statusCode = 400;
            throw err;
        }
        if (!rawStartDate) {
            const err = new Error('Start date is required');
            err.statusCode = 400;
            throw err;
        }

        // Coerce enums to safe values
        const currency = CURRENCIES.has(rawCurrency) ? rawCurrency : 'USD';
        const frequency = FREQUENCIES.has(rawFrequency) ? rawFrequency : 'monthly';
        const category = CATEGORIES.has(rawCategory) ? rawCategory : 'other';

        // Ensure price has max 2 decimals
        const price = Math.round(Number(rawPrice) * 100) / 100;

        const payload = {
            name: rawName,
            price,
            currency,
            frequency,
            category,
            paymentMethod: rawPaymentMethod,
            startDate: rawStartDate,
            renewalDate: rawRenewalDate,
            status: req.body?.status?.toLowerCase(),
            user: req.user._id,
        };

        const subscription = await Subscription.create(payload);
        // Audit create
        logAudit({
            actorId: req.user._id,
            action: 'CREATE_SUBSCRIPTION',
            targetType: 'SUBSCRIPTION',
            targetId: subscription._id,
            metadata: { name: subscription.name, price: subscription.price },
            req
        });
    res.status(201).json({ success: true, data: subscription});
    } catch(error) {
        next(error);
    }
}


export const getUserSubscriptions = async (req, res, next) => {
    try {
        const { id } = req.params;
    const isOwner = req.user?._id?.toString() === id;
    const isElevated = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(req.user?.role);

        // Allow owner or elevated roles to view a user's subscriptions
        if (!isOwner && !isElevated) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: id });

        res.status(200).json({ success: true, data: subscriptions });

    } catch (error) {
        next(error);
    }
}

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const filters = {};
        // Optional basic filtering by query params (e.g., ?user=ID&status=active)
        if (req.query.user) filters.user = req.query.user;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.frequency) filters.frequency = req.query.frequency;

        const subscriptions = await Subscription.find(filters)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
        next(error);
    }
}

export const getSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id).populate('user', 'name email');
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        // Allow owner or elevated roles
        const isOwner = subscription.user && (subscription.user._id?.toString?.() || subscription.user.toString?.()) === req.user?._id?.toString?.();
        const elevated = ['SUPER_ADMIN','ADMIN','MANAGER'].includes(req.user?.role);
        if (!isOwner && !elevated) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) { next(error); }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + 30); // next 30 days

        let query = { renewalDate: { $gte: now, $lte: futureDate } };

        // If not elevated role, only show user's own
        if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(req.user.role)) {
            query.user = req.user._id;
        }

        const subscriptions = await Subscription.find(query).populate('user', 'name email').sort({ renewalDate: 1 });

        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) { next(error); }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        // Ownership or elevated role check (basic ownership for now)
        if (subscription.user.toString() !== req.user._id.toString() && !['SUPER_ADMIN','ADMIN','MANAGER'].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        Object.assign(subscription, req.body);
        await subscription.save();
        logAudit({
            actorId: req.user._id,
            action: 'UPDATE_SUBSCRIPTION',
            targetType: 'SUBSCRIPTION',
            targetId: subscription._id,
            metadata: { updatedFields: Object.keys(req.body) },
            req
        });
        res.status(200).json({ success: true, data: subscription });
    } catch (error) { next(error); }
}

export const deleteSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        if (subscription.user.toString() !== req.user._id.toString() && !['SUPER_ADMIN','ADMIN'].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        await subscription.deleteOne();
        logAudit({
            actorId: req.user._id,
            action: 'DELETE_SUBSCRIPTION',
            targetType: 'SUBSCRIPTION',
            targetId: subscription._id,
            metadata: {},
            req
        });
        res.status(200).json({ success: true, message: 'Subscription deleted'});
    } catch (error) { next(error); }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        if (subscription.user.toString() !== req.user._id.toString() && !['SUPER_ADMIN','ADMIN','MANAGER'].includes(req.user.role)) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        subscription.status = 'cancelled';
        await subscription.save();
        logAudit({
            actorId: req.user._id,
            action: 'CANCEL_SUBSCRIPTION',
            targetType: 'SUBSCRIPTION',
            targetId: subscription._id,
            metadata: {},
            req
        });
        res.status(200).json({ success: true, data: subscription });
    } catch (error) { next(error); }
}
export default { createSubscription, getUserSubscriptions, getAllSubscriptions, getSubscription, updateSubscription, deleteSubscription, cancelSubscription, getUpcomingRenewals }