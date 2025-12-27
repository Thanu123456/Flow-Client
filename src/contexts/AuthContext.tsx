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
          // Token expired, try refresh or logout
          // For now, simpler logout, but interceptor handles refresh logic usually.
          // If we rely on interceptor to refresh, we might not need to check exp here strictly
          // unless checking for initial valid session.
          // Let's rely on stored user info or re-fetch profile if needed.
          // Since we don't store full user object in localStorage usually, let's decode what we can
          // or assume we need to re-fetch "me" if API supports it.
          // Given the requirements, we'll try to restore state from what we have.
          
          // However, for strictness:
          logout();
          return;
        }

        // We should ideally fetch current user details here
        // But for now, let's trust we are authenticated if token exists and valid
        // We might need to store user details in localStorage too to persist across reloads
        // OR have a /me endpoint. The requirements didn't explicitly detail /me but implied token claims.
        
        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');
        const isKiosk = localStorage.getItem('isKiosk') === 'true';

        setState({
            user: storedUser ? JSON.parse(storedUser) : null,
            tenant: storedTenant ? JSON.parse(storedTenant) : null,
            isAuthenticated: true,
            isLoading: false,
            role: decoded.role || null, // Assuming role is in token claims
            isKiosk: isKiosk,
            mustChangePassword: false,
        });

      } catch (error) {
        logout();
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
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
    try {
      await authService.logout();
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('isKiosk');
        setState({
            user: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false,
            role: null,
            isKiosk: false,
            mustChangePassword: false,
        });
        // Redirect to login if needed, or let protected routes handle it
        window.location.href = '/login';
    }
  };

  // Helper to handle state updates after login
  const handleLoginSuccess = (response: LoginResponse) => {
    // Check Tenant Status if present (Owner/Admin)
    if (response.tenant) {
      const status = response.tenant.registration_status?.toLowerCase();
      // Assume 'active' is the only valid state for login, unless we allow 'pending' access?
      // Requirement: "display specific messages for: Pending, Rejected, Suspended"
      // This implies they should NOT be logged in, but shown a message.
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
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    if (response.tenant) {
        localStorage.setItem('tenant', JSON.stringify(response.tenant));
    }
    localStorage.setItem('isKiosk', 'false');

    setState({
        user: response.user,
        tenant: response.tenant || null,
        isAuthenticated: true,
        isLoading: false,
        role: response.user.user_type, // or derive from claims
        isKiosk: false,
        mustChangePassword: response.must_change_password,
    });
  };

  const handleSuperAdminLoginSuccess = (response: SuperAdminLoginResponse) => {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isKiosk', 'false');

      setState({
          user: response.user,
          tenant: null, // SuperAdmin doesn't start with a specific tenant usually
          isAuthenticated: true,
          isLoading: false,
          role: 'super_admin',
          isKiosk: false,
          mustChangePassword: false, // Super admin specific?
      });
  };

  const handleKioskLoginSuccess = (response: KioskLoginResponse) => {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('tenant', JSON.stringify(response.tenant));
      localStorage.setItem('isKiosk', 'true');

      setState({
          user: response.user,
          tenant: response.tenant,
          isAuthenticated: true,
          isLoading: false,
          role: response.user.role || 'employee',
          isKiosk: true,
          mustChangePassword: response.must_change_pin, // Map pin change to this? Or separate? 
          // Kiosk types has must_change_pin. Let's map it for consistency if we want global "Force Change" state
      });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, superAdminLogin, kioskLogin, logout, endShift }}>
      {children}
    </AuthContext.Provider>
  );
};