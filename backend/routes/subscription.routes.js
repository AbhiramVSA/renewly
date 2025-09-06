/**
 * Subscription Management Routes
 * 
 * Defines all subscription-related API endpoints with role-based access control.
 * Includes CRUD operations, renewal tracking, and cancellation functionality.
 * Routes are ordered to prevent path collision issues.
 * 
 * @author AbhiramVSA
 * @version 1.0.0
 */

import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { 
    createSubscription,
    getUserSubscriptions,
    getAllSubscriptions,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    getUpcomingRenewals
} from '../controllers/subscription.controller.js';
import { requireRoles } from '../middleware/requireRoles.middleware.js';
import { ROLES } from '../constants/roles.js';

const subscriptionRouter = new Router();

// All routes require authentication
// Specific routes are placed before parameterized routes to avoid conflicts

/**
 * GET /user/:id - Get subscriptions for specific user
 * Access: Authenticated users (ownership/role checks in controller)
 * Users can view their own subscriptions, admins can view any user's subscriptions
 */
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

/**
 * GET /upcoming-renewals - Get upcoming subscription renewals
 * Access: Authenticated users (filtered by role in controller)
 * Regular users see their own renewals, managers+ see all renewals
 * Useful for payment reminders and revenue forecasting
 */
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

/**
 * POST / - Create new subscription
 * Access: Authenticated users
 * Creates subscription for the authenticated user
 * Includes validation and audit logging
 */
subscriptionRouter.post('/', authorize, createSubscription);

/**
 * PUT /:id - Update subscription details
 * Access: Authenticated users (ownership/role checks in controller)
 * Users can update their own subscriptions, admins can update any subscription
 * Includes audit logging for subscription changes
 */
subscriptionRouter.put('/:id', authorize, updateSubscription);

/**
 * DELETE /:id - Permanently delete subscription
 * Access: Authenticated users (ownership/role checks in controller)
 * Users can delete their own subscriptions, admins can delete any subscription
 * Includes audit logging for subscription deletion
 */
subscriptionRouter.delete('/:id', authorize, deleteSubscription);

/**
 * PUT /:id/cancel - Cancel subscription (soft delete)
 * Access: Authenticated users (ownership/role checks in controller)
 * Sets subscription status to cancelled without permanent deletion
 * Includes audit logging for cancellation events
 */
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

/**
 * GET / - Get all subscriptions (admin view)
 * Access: SUPER_ADMIN, ADMIN, MANAGER only
 * Returns all subscriptions in the system for management purposes
 * Supports filtering and pagination for large datasets
 */
subscriptionRouter.get('/', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), getAllSubscriptions);

/**
 * GET /:id - Get specific subscription details
 * Access: Authenticated users (ownership/role checks in controller)
 * Users can view their own subscription details, admins can view any subscription
 */
subscriptionRouter.get('/:id', authorize, getSubscription);

export default subscriptionRouter;
