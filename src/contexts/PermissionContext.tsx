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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      // Logic to load permissions
      // 1. If UserType is 'owner' or 'super_admin', grant all permissions
      // Type guard to check if user has user_type (UserInfo) vs KioskUserInfo
      const isOwnerOrAdmin = 'user_type' in user && (user.user_type === 'owner' || user.is_super_admin);
      
      if (isOwnerOrAdmin) {
        // We can represent "all" as a special flag or just return true in hasPermission
        // But for consistency, let's keep the array empty and handle it in checks
        setPermissions(Object.values(PERMISSIONS));
      } else {
        // 2. If Employee, we need to fetch permissions from API
        // For now, if API does not return them, we might be stuck.
        // TODO: Implement API fetch for permissions if not present in User object
        // const fetchedPermissions = await authService.getMyPermissions();
        // setPermissions(fetchedPermissions);
        
        // Placeholder for now:
        setPermissions([]); 
      }
      setLoading(false);
    };

    loadPermissions();
  }, [user, isAuthenticated, authLoading]);

  const isAdmin = !!user && 'user_type' in user && (user.user_type === 'owner' || user.is_super_admin);

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
