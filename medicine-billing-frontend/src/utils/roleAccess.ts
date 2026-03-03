export const hasRequiredRole = (userRole?: string, allowedRoles?: string[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
