import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatRole, getRoleColor } from '@/lib/auth';
import type { Role } from '@/types';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  return (
    <Badge 
      variant="secondary" 
      className={`${getRoleColor(role)} ${className}`}
    >
      {formatRole(role)}
    </Badge>
  );
};
