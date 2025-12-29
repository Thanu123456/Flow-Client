import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth/authService';
import type { 
  LoginRequest, 
  RegisterRequest, 
  UserInfo, 
  TenantInfo, 
  LoginResponse 
} from '../types/auth/auth.types';
import type { 
  KioskLoginRequest, 
  KioskUserInfo, 
  KioskLoginResponse,
  KioskEndShiftResponse
} from '../types/auth/kiosk.types';
import type { 
  SuperAdminLoginRequest, 
  SuperAdminLoginResponse 
} from '../types/auth/superadmin.types';

interface AuthState {
  user: UserInfo | KioskUserInfo | null;
  tenant: TenantInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  isKiosk: boolean;
  mustChangePassword: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<LoginResponse | void>;
  register: (data: RegisterRequest) => Promise<void>;
  superAdminLogin: (data: SuperAdminLoginRequest) => Promise<void>;
  kioskLogin: (data: KioskLoginRequest) => Promise<void>;

  logout: () => Promise<void>;
  endShift: () => Promise<KioskEndShiftResponse | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
    isKiosk: false,
    mustChangePassword: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired, clear state and let user re-login
          clearAuthState();
          return;
        }

        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');
        const isKiosk = localStorage.getItem('isKiosk') === 'true';
        const storedRole = localStorage.getItem('role');
        const storedMustChangePassword = localStorage.getItem('mustChangePassword') === 'true';

        // Determine role from stored value, token claims, or user object
        let role = storedRole || decoded.role || null;
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        // If role not found, derive from user object
        if (!role && parsedUser) {
          if (parsedUser.is_super_admin) {
            role = 'super_admin';
          } else if (parsedUser.user_type) {
            role = parsedUser.user_type;
          }
        }

        setState({
            user: parsedUser,
            tenant: storedTenant ? JSON.parse(storedTenant) : null,
            isAuthenticated: true,
            isLoading: false,
            role: role,
            isKiosk: isKiosk,
            mustChangePassword: storedMustChangePassword,
        });

      } catch (error) {
        clearAuthState();
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    localStorage.removeItem('isKiosk');
    localStorage.removeItem('role');
    localStorage.removeItem('mustChangePassword');
    setState({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      isKiosk: false,
      mustChangePassword: false,
    });
  };

  const login = async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.login(data);
      handleLoginSuccess(response);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.register(data);
      // Registration successful, but usually requires approval or email verification
      // Requirements say: "Redirect to login page with info banner"
      // So we don't log them in automatically.
    } catch (error) {
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const superAdminLogin = async (data: SuperAdminLoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.superAdminLogin(data);
      handleSuperAdminLoginSuccess(response);
    } catch (error) {
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const kioskLogin = async (data: KioskLoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
        const response = await authService.kioskLogin(data);
        handleKioskLoginSuccess(response);
    } catch (error) {
        throw error;
    } finally {
        setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const endShift = async () => {
      try {
          const summary = await authService.endShift();
          // After ending shift, we logout
          await logout();
          return summary;
      } catch (error) {
          throw error;
      }
  };

  const logout = async () => {
    // Capture current role and isKiosk before clearing
    const currentRole = state.role;
    const wasKiosk = state.isKiosk;

    try {
      await authService.logout();
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        clearAuthState();

        // Redirect based on user type
        if (currentRole === 'super_admin') {
          window.location.href = '/superadmin/login';
        } else if (wasKiosk) {
          window.location.href = '/kiosk/login';
        } else {
          window.location.href = '/login';
        }
    }
  };

  // Helper to handle state updates after login
  const handleLoginSuccess = (response: LoginResponse) => {
    // Check Tenant Status if present (Owner/Admin)
    if (response.tenant) {
      const status = response.tenant.registration_status?.toLowerCase();
      const validStatuses = ['active'];
      if (status && !validStatuses.includes(status)) {
        let errorMsg = 'Your account is currently inactive.';
        if (status === 'pending') {
            errorMsg = 'Your account is awaiting admin approval. You will be notified via email once approved.';
        } else if (status === 'rejected') {
            errorMsg = 'Your registration was not approved. Please contact support for more information.';
        } else if (status === 'suspended') {
             errorMsg = 'Your account has been temporarily suspended. Please contact support.';
        }
        throw new Error(errorMsg);
      }
    }

    // Determine role
    const role = response.user.is_super_admin ? 'super_admin' : response.user.user_type;

    // Store in localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('role', role);
    localStorage.setItem('mustChangePassword', String(response.must_change_password));
    localStorage.setItem('isKiosk', 'false');
    if (response.tenant) {
        localStorage.setItem('tenant', JSON.stringify(response.tenant));
    }

    setState({
        user: response.user,
        tenant: response.tenant || null,
        isAuthenticated: true,
        isLoading: false,
        role: role,
        isKiosk: false,
        mustChangePassword: response.must_change_password,
    });
  };

  const handleSuperAdminLoginSuccess = (response: SuperAdminLoginResponse) => {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', 'super_admin');
      localStorage.setItem('mustChangePassword', String(response.must_change_password));
      localStorage.setItem('isKiosk', 'false');

      setState({
          user: response.user,
          tenant: null, // SuperAdmin doesn't have a specific tenant
          isAuthenticated: true,
          isLoading: false,
          role: 'super_admin',
          isKiosk: false,
          mustChangePassword: response.must_change_password,
      });
  };

  const handleKioskLoginSuccess = (response: KioskLoginResponse) => {
      const role = response.user.role || 'employee';

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('tenant', JSON.stringify(response.tenant));
      localStorage.setItem('role', role);
      localStorage.setItem('mustChangePassword', String(response.must_change_pin));
      localStorage.setItem('isKiosk', 'true');

      setState({
          user: response.user,
          tenant: response.tenant,
          isAuthenticated: true,
          isLoading: false,
          role: role,
          isKiosk: true,
          mustChangePassword: response.must_change_pin,
      });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, superAdminLogin, kioskLogin, logout, endShift }}>
      {children}
    </AuthContext.Provider>
  );
};