import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  user_id: string;
  tenant_id?: string;
  schema_name?: string;
  user_type: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Check if a token is valid and not expired
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Get decoded token data
 */
export const getTokenData = (token: string | null): DecodedToken | null => {
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

/**
 * Get the current token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated based on stored token
 */
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return isTokenValid(token);
};

/**
 * Get the current user's role from token or localStorage
 */
export const getUserRole = (): string | null => {
  const storedRole = localStorage.getItem('role');
  if (storedRole) return storedRole;

  const token = getStoredToken();
  const tokenData = getTokenData(token);
  return tokenData?.user_type || tokenData?.role || null;
};

/**
 * Check if current user is a super admin
 */
export const isSuperAdmin = (): boolean => {
  return getUserRole() === 'super_admin';
};

/**
 * Check if current user is an owner
 */
export const isOwner = (): boolean => {
  return getUserRole() === 'owner';
};

/**
 * Check if current user is in kiosk mode
 */
export const isKioskMode = (): boolean => {
  return localStorage.getItem('isKiosk') === 'true';
};

/**
 * Check if user must change password
 */
export const mustChangePassword = (): boolean => {
  return localStorage.getItem('mustChangePassword') === 'true';
};

/**
 * Get the appropriate login redirect URL based on user type
 */
export const getLoginRedirectUrl = (): string => {
  const role = getUserRole();
  const isKiosk = isKioskMode();

  if (role === 'super_admin') {
    return '/superadmin/login';
  } else if (isKiosk) {
    return '/kiosk/login';
  }
  return '/login';
};

/**
 * Get the appropriate dashboard URL based on user type
 */
export const getDashboardUrl = (): string => {
  const role = getUserRole();
  const isKiosk = isKioskMode();

  if (role === 'super_admin') {
    return '/superadmin/dashboard';
  } else if (isKiosk) {
    return '/kiosk/dashboard';
  }
  return '/dashboard';
};

/**
 * Clear all auth-related data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');
  localStorage.removeItem('role');
  localStorage.removeItem('isKiosk');
  localStorage.removeItem('mustChangePassword');
};

/**
 * Get stored user data
 */
export const getStoredUser = <T = unknown>(): T | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    return JSON.parse(user) as T;
  } catch {
    return null;
  }
};

/**
 * Get stored tenant data
 */
export const getStoredTenant = <T = unknown>(): T | null => {
  const tenant = localStorage.getItem('tenant');
  if (!tenant) return null;

  try {
    return JSON.parse(tenant) as T;
  } catch {
    return null;
  }
};

/**
 * Route guard helper - checks if user can access a route
 */
export const canAccessRoute = (
  requiredRoles?: string[],
  requireAuth = true
): { allowed: boolean; redirectTo?: string } => {
  if (!requireAuth) {
    return { allowed: true };
  }

  if (!isAuthenticated()) {
    return { allowed: false, redirectTo: getLoginRedirectUrl() };
  }

  if (mustChangePassword()) {
    const role = getUserRole();
    if (role === 'super_admin') {
      return { allowed: false, redirectTo: '/superadmin/change-password' };
    }
    return { allowed: false, redirectTo: '/change-password' };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = getUserRole();
    if (!userRole || !requiredRoles.includes(userRole)) {
      return { allowed: false, redirectTo: getDashboardUrl() };
    }
  }

  return { allowed: true };
};
