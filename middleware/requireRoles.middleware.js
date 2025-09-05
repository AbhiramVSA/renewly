import { ROLES } from '../constants/roles.js';

// Usage: requireRoles(ROLES.ADMIN, ROLES.MANAGER)
export function requireRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Hierarchy-based: requireAtLeast('MANAGER') allows MANAGER, ADMIN, SUPER_ADMIN
export function requireAtLeast(minRole) {
  const hierarchy = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'READ_ONLY', 'SERVICE'];
  const idx = hierarchy.indexOf(minRole);
  if (idx === -1) throw new Error('Unknown role in requireAtLeast');
  const allowed = hierarchy.slice(0, idx + 1);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
