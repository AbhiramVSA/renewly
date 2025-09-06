import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasAnyRole } from '@/lib/auth';
import type { Role } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredRoles?: Role[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (requiredRole) {
    hasAccess = hasRole(user.role, requiredRole);
  } else if (requiredRoles) {
    hasAccess = hasAnyRole(user.role, requiredRoles);
  } else {
    hasAccess = true; // No role requirement
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common role combinations
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard requiredRoles={['SUPER_ADMIN', 'ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ManagerAndUp: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard requiredRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleGuard requiredRole="SUPER_ADMIN" fallback={fallback}>
    {children}
  </RoleGuard>
);
