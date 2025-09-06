import { jwtDecode } from 'jwt-decode';
import type { JWTPayload, Role } from '@/types';

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<Role, number> = {
  'SUPER_ADMIN': 6,
  'ADMIN': 5,
  'MANAGER': 4,
  'USER': 3,
  'READ_ONLY': 2,
  'SERVICE': 1,
};

export const getRoleRank = (role: Role): number => {
  return ROLE_HIERARCHY[role] || 0;
};

export const hasRole = (userRole: Role, requiredRole: Role): boolean => {
  return getRoleRank(userRole) >= getRoleRank(requiredRole);
};

export const hasAnyRole = (userRole: Role, requiredRoles: Role[]): boolean => {
  return requiredRoles.some(role => hasRole(userRole, role));
};

export const canManageUsers = (role: Role): boolean => {
  return hasAnyRole(role, ['SUPER_ADMIN', 'ADMIN']);
};

export const canViewAllSubscriptions = (role: Role): boolean => {
  return hasAnyRole(role, ['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
};

export const canDeleteUser = (role: Role): boolean => {
  return role === 'SUPER_ADMIN';
};

export const canChangeUserRole = (currentUserRole: Role, targetRole: Role): boolean => {
  if (currentUserRole === 'SUPER_ADMIN') return true;
  if (currentUserRole === 'ADMIN') {
    // Admins can't promote to SUPER_ADMIN or change other SUPER_ADMIN/ADMIN roles
    return !hasAnyRole(targetRole, ['SUPER_ADMIN', 'ADMIN']);
  }
  return false;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getUserFromToken = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
};

// Format role for display
export const formatRole = (role: Role): string => {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Get role color for UI
export const getRoleColor = (role: Role): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'MANAGER':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'USER':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    case 'READ_ONLY':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'SERVICE':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};