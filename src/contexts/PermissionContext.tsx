import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import type { Permission } from '../types/auth/permissions';
import { PERMISSIONS } from '../types/auth/permissions';

interface PermissionContextType {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isLoading: boolean;
  isAdmin: boolean; // Owner or Super Admin
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const loadPermissions = () => {
      // Check if user is owner or super_admin - grant all permissions
      const isSuperAdmin = role === 'super_admin';
      const isOwner = 'user_type' in user && user.user_type === 'owner';
      const hasAdminFlag = 'is_super_admin' in user && user.is_super_admin;

      if (isSuperAdmin || isOwner || hasAdminFlag) {
        // Grant all permissions to owners and super admins
        setPermissions(Object.values(PERMISSIONS));
      } else {
        // For employees, check if permissions are included in user object
        if ('permissions' in user && Array.isArray(user.permissions)) {
          // Use permissions from user object (sent from backend)
          setPermissions(user.permissions as Permission[]);
        } else {
          // Default: no special permissions for employees without assigned permissions
          // They will only have access to routes not protected by PermissionRoute
          setPermissions([]);
        }
      }
      setLoading(false);
    };

    loadPermissions();
  }, [user, isAuthenticated, authLoading, role]);

  // Check if user is admin (owner or super_admin)
  const isAdmin = role === 'super_admin' ||
    (!!user && 'user_type' in user && user.user_type === 'owner') ||
    (!!user && 'is_super_admin' in user && user.is_super_admin);

  const hasPermission = (permission: Permission): boolean => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    if (isAdmin) return true;
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    if (isAdmin) return true;
    return requiredPermissions.every(p => permissions.includes(p));
  };

  return (
    <PermissionContext.Provider value={{
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isLoading: loading,
      isAdmin
    }}>
      {children}
    </PermissionContext.Provider>
  );
};
