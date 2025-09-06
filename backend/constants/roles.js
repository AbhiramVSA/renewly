// Central role constants and helpers
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
  READ_ONLY: 'READ_ONLY',
  SERVICE: 'SERVICE'
});

export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.USER,
  ROLES.READ_ONLY,
  ROLES.SERVICE // service treated separately (machine/service accounts)
];

export const PRIVILEGED_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
export const MANAGEMENT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

export function atLeast(role) {
  const idx = ROLE_HIERARCHY.indexOf(role);
  if (idx === -1) return [];
  return ROLE_HIERARCHY.slice(0, idx + 1);
}
