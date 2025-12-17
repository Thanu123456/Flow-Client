import api from '../../utils/api';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse 
} from '../../types/auth/auth.types';
import type { 
  KioskLoginRequest, 
  KioskLoginResponse 
} from '../../types/auth/kiosk.types';
import type { 
  SuperAdminLoginRequest, 
  SuperAdminLoginResponse 
} from '../../types/auth/superadmin.types';

export const authService = {
  // Owner/Admin Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<{ data: LoginResponse }>('/auth/login', data);
    return response.data.data;
  },

  // Owner Registration
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<{ data: RegisterResponse }>('/auth/register', data);
    return response.data.data;
  },

  // Super Admin Login
  async superAdminLogin(data: SuperAdminLoginRequest): Promise<SuperAdminLoginResponse> {
    const response = await api.post<{ data: SuperAdminLoginResponse }>('/auth/super-admin-login', data);
    return response.data.data;
  },

  // Kiosk Login
  async kioskLogin(data: KioskLoginRequest): Promise<KioskLoginResponse> {
    const response = await api.post<{ data: KioskLoginResponse }>('/auth/kiosk-login', data);
    return response.data.data;
  },

  // Refresh Token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<{ data: { token: string } }>('/auth/refresh-token');
    return response.data.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Google OAuth (Optional/Future)
  async googleLogin(token: string): Promise<LoginResponse> {
    const response = await api.post<{ data: LoginResponse }>('/auth/google', { token });
    return response.data.data;
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset Password
  async resetPassword(data: any): Promise<void> {
    await api.post('/auth/reset-password', data);
  }
};
