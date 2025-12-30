import { useMemo, useCallback } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Permission } from '../../types/auth/permissions';

interface UsePermissionsReturn {
  permissions: string[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isOwner: boolean;
  isSuperAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
  role: string | null;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { permissions, hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();
  const { role } = useAuth();

  const isOwner = useMemo(() => role === 'owner', [role]);
  const isSuperAdmin = useMemo(() => role === 'super_admin', [role]);
  const isEmployee = useMemo(() => role === 'employee', [role]);

  // Memoized permission check that also considers owner status
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Owners have all permissions
    if (isOwner) return true;
    // Super admins have all permissions
    if (isSuperAdmin) return true;
    // Check specific permission
    return hasPermission(permission);
  }, [isOwner, isSuperAdmin, hasPermission]);

  const checkAnyPermission = useCallback((perms: Permission[]): boolean => {
    if (isOwner || isSuperAdmin) return true;
    return hasAnyPermission(perms);
  }, [isOwner, isSuperAdmin, hasAnyPermission]);

  const checkAllPermissions = useCallback((perms: Permission[]): boolean => {
    if (isOwner || isSuperAdmin) return true;
    return hasAllPermissions(perms);
  }, [isOwner, isSuperAdmin, hasAllPermissions]);

  return {
    permissions,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isOwner,
    isSuperAdmin,
    isEmployee,
    isLoading,
    role,
  };
};

export default usePermissions;
