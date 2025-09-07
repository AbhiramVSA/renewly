/**
 * User Management Routes
 * 
 * Defines all user-related API endpoints with proper authentication and authorization.
 * Includes CRUD operations for user management with role-based access control.
 * 
 * @author AbhiramVSA
 * @version 1.0.0
 */

import { Router } from 'express';
import { getUsers, getUser, changeUserRole, createUser, updateUser, deleteUser, changePassword } from "../controllers/user.controller.js";
import authorize from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/requireRoles.middleware.js";
import { ROLES } from "../constants/roles.js";

const userRouter = Router();

// All routes require authentication
// Role-specific restrictions are applied per endpoint

/**
 * GET /users - Retrieve all users
 * Access: SUPER_ADMIN, ADMIN only
 * Returns paginated list of all users in the system
 */
userRouter.get('/users', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), getUsers);

/**
 * GET /:id - Retrieve user by ID
 * Access: Authenticated users (with ownership/role checks in controller)
 * Users can view their own profile, admins can view any profile
 */
userRouter.get('/:id', authorize, getUser);

/**
 * PATCH /:userId/role - Change user's role
 * Access: SUPER_ADMIN, ADMIN only
 * ADMIN cannot assign SUPER_ADMIN role (elevation protection)
 * Includes audit logging for role changes
 */
userRouter.patch('/:userId/role', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), changeUserRole);

/**
 * POST / - Create new user
 * Access: SUPER_ADMIN, ADMIN only
 * Creates new user account with specified role and credentials
 * Includes password hashing and audit logging
 */
userRouter.post('/', authorize, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), createUser);

/**
 * PUT /:id - Update user information
 * Access: Authenticated users (with ownership/role checks in controller)
 * Users can update their own profile, admins can update any profile
 * Includes audit logging for profile changes
 */
userRouter.put('/:id', authorize, updateUser);

/**
 * PATCH /:id/password - Change user password
 * Access: Authenticated users (self with current password) or ADMIN/SUPER_ADMIN
 */
userRouter.patch('/:id/password', authorize, changePassword);

/**
 * DELETE /:id - Delete user account
 * Access: SUPER_ADMIN only
 * Permanently removes user account from the system
 * Includes audit logging for account deletion
 */
userRouter.delete('/:id', authorize, requireRoles(ROLES.SUPER_ADMIN), deleteUser);

export default userRouter;