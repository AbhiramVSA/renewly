import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasAnyRole } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
  requiredRoles?: Role[];
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles,
  fallback 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(user.role, requiredRole)) {
    return fallback || <Navigate to="/dashboard" replace />;
  }

  if (requiredRoles && !hasAnyRole(user.role, requiredRoles)) {
    return fallback || <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};