import api from '../../utils/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  MfaSetupResponse,
  MfaStatusResponse,
  MfaLoginResponse,
  MfaVerifyLoginRequest,
  EmailVerificationResponse,
  ResendVerificationResponse
} from '../../types/auth/auth.types';
import type {
  KioskLoginRequest,
  KioskLoginResponse,
  KioskEndShiftResponse
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

  // Super Admin Login - Backend: POST /superadmin/login
  async superAdminLogin(data: SuperAdminLoginRequest): Promise<SuperAdminLoginResponse> {
    const response = await api.post<{ data: SuperAdminLoginResponse }>('/superadmin/login', data);
    return response.data.data;
  },

  // Kiosk Login - Backend: POST /kiosk/login
  async kioskLogin(data: KioskLoginRequest): Promise<KioskLoginResponse> {
    const response = await api.post<{ data: KioskLoginResponse }>('/kiosk/login', data);
    return response.data.data;
  },

  // Kiosk End Shift - Backend: POST /kiosk/end-shift
  async endShift(): Promise<KioskEndShiftResponse> {
    const response = await api.post<{ data: KioskEndShiftResponse }>('/kiosk/end-shift');
    return response.data.data;
  },

  // Kiosk Logout - Backend: POST /kiosk/logout
  async kioskLogout(): Promise<void> {
    await api.post('/kiosk/logout');
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
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data);
  },

  // Change Password (Authenticated)
  async changePassword(data: any): Promise<void> {
    await api.post('/auth/change-password', data);
  },

  // ==================== MFA/2FA Methods ====================

  // Setup MFA - Returns QR code and secret
  async setupMfa(): Promise<MfaSetupResponse> {
    const response = await api.post<{ data: MfaSetupResponse }>('/auth/mfa/setup');
    return response.data.data;
  },

  // Verify and Enable MFA
  async verifyAndEnableMfa(code: string): Promise<{ message: string }> {
    const response = await api.post<{ data: { message: string } }>('/auth/mfa/verify', { code });
    return response.data.data;
  },

  // Disable MFA
  async disableMfa(code: string): Promise<{ message: string }> {
    const response = await api.post<{ data: { message: string } }>('/auth/mfa/disable', { code });
    return response.data.data;
  },

  // Get MFA Status
  async getMfaStatus(): Promise<MfaStatusResponse> {
    const response = await api.get<{ data: MfaStatusResponse }>('/auth/mfa/status');
    return response.data.data;
  },

  // Verify MFA during login (when MFA is required)
  async verifyMfaLogin(data: MfaVerifyLoginRequest): Promise<LoginResponse> {
    const response = await api.post<{ data: LoginResponse }>('/auth/mfa/verify-login', data);
    return response.data.data;
  },

  // Generate new backup codes
  async regenerateBackupCodes(code: string): Promise<{ backup_codes: string[] }> {
    const response = await api.post<{ data: { backup_codes: string[] } }>('/auth/mfa/backup-codes', { code });
    return response.data.data;
  },

  // ==================== Email Verification Methods ====================

  // Verify email with token
  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await api.post<{ data: EmailVerificationResponse }>('/auth/verify-email', { token });
    return response.data.data;
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<ResendVerificationResponse> {
    const response = await api.post<{ data: ResendVerificationResponse }>('/auth/resend-verification', { email });
    return response.data.data;
  },

  // Check email verification status
  async checkEmailVerificationStatus(): Promise<{ verified: boolean }> {
    const response = await api.get<{ data: { verified: boolean } }>('/auth/email-status');
    return response.data.data;
  }
};
