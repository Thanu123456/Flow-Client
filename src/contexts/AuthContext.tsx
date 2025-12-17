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
  KioskLoginResponse 
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
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  superAdminLogin: (data: SuperAdminLoginRequest) => Promise<void>;
  kioskLogin: (data: KioskLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
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
        });
        // Redirect to login if needed, or let protected routes handle it
        window.location.href = '/login';
    }
  };

  // Helper to handle state updates after login
  const handleLoginSuccess = (response: LoginResponse) => {
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
      });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, superAdminLogin, kioskLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};