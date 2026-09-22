import api from '../../utils/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  MfaSetupResponse,
  MfaStatusResponse,
  MfaVerifyLoginRequest,
  EmailVerificationResponse,
  ResendVerificationResponse
} from '../../types/auth/auth.types';
import type {
  KioskLoginRequest,
  KioskLoginResponse,
  KioskEndShiftResponse,
  KioskSessionInfo,
  KioskStoreInfo,
  OverrideAuthorization,
  ShiftInsights,
  HeartbeatResult,
  KioskDeviceInfo
} from '../../types/auth/kiosk.types';
import type {
  SuperAdminLoginRequest,
  SuperAdminLoginResponse
} from '../../types/auth/superadmin.types';
import type { ElevationResponse } from '../../utils/elevation';

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
  // The kiosk device isn't authenticated yet (no JWT to carry tenant info),
  // so the tenant this device is branded for — resolved earlier and stashed
  // in localStorage by a prior owner/kiosk login on this device — has to be
  // sent explicitly. Without it the backend can't tell which shop's schema
  // to look the employee up in.
  async kioskLogin(data: KioskLoginRequest): Promise<KioskLoginResponse> {
    let tenantId: string | undefined;
    try {
      const storedTenant = localStorage.getItem('tenant');
      tenantId = storedTenant ? JSON.parse(storedTenant).id : undefined;
    } catch {
      tenantId = undefined;
    }

    const response = await api.post<{ data: KioskLoginResponse }>('/kiosk/login', data, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined,
    });
    return response.data.data;
  },

  // Kiosk End Shift - Backend: POST /kiosk/end-shift
  async endShift(closingCash?: number, closingDenomination?: string): Promise<KioskEndShiftResponse> {
    const response = await api.post<{ data: KioskEndShiftResponse }>('/kiosk/end-shift', {
      closing_cash: closingCash,
      closing_denomination: closingDenomination,
    });
    return response.data.data;
  },

  // Kiosk manual cash-drawer movement (float top-up, petty cash out, etc.)
  // Backend: POST /kiosk/cash-movement
  async recordCashMovement(direction: 'in' | 'out', amount: number, note?: string): Promise<void> {
    await api.post('/kiosk/cash-movement', { direction, amount, note });
  },

  // Kiosk Session Info (live shift totals) - Backend: GET /kiosk/session
  async getKioskSession(): Promise<KioskSessionInfo> {
    const response = await api.get<{ data: KioskSessionInfo }>('/kiosk/session');
    return response.data.data;
  },

  // Live cash summary for the CURRENT (still-active) shift — used to preview
  // expected cash before actually ending it. Backend: GET /kiosk/shift-summary
  async getShiftSummary(): Promise<KioskEndShiftResponse> {
    const response = await api.get<{ data: KioskEndShiftResponse }>('/kiosk/shift-summary');
    return response.data.data;
  },

  // Hourly trend / top items / discount+refund counts for the current shift.
  // Backend: GET /kiosk/shift-insights
  async getShiftInsights(): Promise<ShiftInsights> {
    const response = await api.get<{ data: ShiftInsights }>('/kiosk/shift-insights');
    return response.data.data;
  },

  // Fleet-view presence check-in — Backend: POST /kiosk/heartbeat. Called
  // periodically by every kiosk device; see hooks/kiosk/useKioskHeartbeat.
  async kioskHeartbeat(deviceId: string): Promise<HeartbeatResult> {
    const response = await api.post<{ data: HeartbeatResult }>('/kiosk/heartbeat', { device_id: deviceId });
    return response.data.data;
  },

  // Fleet view (admin) — Backend: /admin/kiosk-devices*
  async listKioskDevices(): Promise<KioskDeviceInfo[]> {
    const response = await api.get<{ data: KioskDeviceInfo[] }>('/admin/kiosk-devices');
    return response.data.data;
  },

  async renameKioskDevice(id: string, deviceName: string): Promise<void> {
    await api.patch(`/admin/kiosk-devices/${id}`, { device_name: deviceName });
  },

  async signOutKioskDevice(id: string): Promise<void> {
    await api.post(`/admin/kiosk-devices/${id}/sign-out`);
  },

  async removeKioskDevice(id: string): Promise<void> {
    await api.delete(`/admin/kiosk-devices/${id}`);
  },

  // Kiosk Logout - Backend: POST /kiosk/logout
  async kioskLogout(): Promise<void> {
    await api.post('/kiosk/logout');
  },

  // Manager steps from the register into the back office — Backend:
  // POST /kiosk/elevate. Answers with a ten-minute, non-refreshable full
  // session for that manager (see utils/elevation.ts for how it's swapped in).
  async elevateToBackOffice(managerUserId: string, pin: string): Promise<ElevationResponse> {
    const response = await api.post<{ data: ElevationResponse }>('/kiosk/elevate', {
      manager_user_id: managerUserId,
      pin,
    });
    return response.data.data;
  },

  // Manager override — Backend: POST /kiosk/authorize-override. Used when the
  // signed-in cashier's own role can't authorize a discount or refund on its
  // own; a manager enters their own User ID + PIN to approve it in place.
  async authorizeOverride(managerUserId: string, pin: string, permission: string): Promise<OverrideAuthorization> {
    const response = await api.post<{ data: OverrideAuthorization }>('/kiosk/authorize-override', {
      manager_user_id: managerUserId,
      pin,
      permission,
    });
    return response.data.data;
  },

  // Device pairing — Backend: POST /kiosk/resolve-store (public, no tenant
  // context needed yet). Used to brand a fresh kiosk device to a shop from a
  // short code shown in that shop's admin dashboard, instead of requiring a
  // prior full owner/admin login on that exact device.
  async resolveKioskStore(code: string): Promise<KioskStoreInfo> {
    const response = await api.post<{ data: KioskStoreInfo }>('/kiosk/resolve-store', { code });
    return response.data.data;
  },

  // Backend: GET /admin/settings/kiosk-pairing-code (owner/admin only) — the
  // code to read out when setting up a new kiosk device.
  async getKioskPairingCode(): Promise<string> {
    const response = await api.get<{ data: { code: string } }>('/admin/settings/kiosk-pairing-code');
    return response.data.data.code;
  },

  // Backend: POST /admin/settings/kiosk-pairing-code/regenerate — rotates the
  // code (e.g. after it's been shared too widely).
  async regenerateKioskPairingCode(): Promise<string> {
    const response = await api.post<{ data: { code: string } }>('/admin/settings/kiosk-pairing-code/regenerate');
    return response.data.data.code;
  },

  // Refresh Token
  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    const response = await api.post<{ data: { access_token: string; refresh_token?: string } }>(
      '/auth/refresh-token',
      { refresh_token: refreshToken }
    );
    // Store rotated refresh token if backend returns a new one
    if (response.data.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.data.refresh_token);
    }
    return { token: response.data.data.access_token };
  },

  // Logout
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    await api.post('/auth/logout', { refresh_token: refreshToken });
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
