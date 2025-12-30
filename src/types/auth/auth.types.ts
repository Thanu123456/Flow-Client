export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  // Business Information
  shop_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_vat_number?: string;

  // Owner Information
  full_name: string;
  email: string;
  phone: string;
  password: string;

  // Address
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code?: string;
  country?: string;

  // Terms
  accept_terms: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_image_url?: string;
  user_type: string;
  is_super_admin: boolean;
  kiosk_enabled: boolean;
  last_login_at?: string;
  role_id?: string;
  role_name?: string;
  permissions?: string[];
}

export interface TenantInfo {
  id: string;
  shop_name: string;
  business_type: string;
  schema_name: string;
  registration_status: string;
  currency: string;
  timezone: string;
  logo_url?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
  tenant?: TenantInfo;
  must_change_password: boolean;
}

export interface RegisterResponse {
  message: string;
  tenant_id: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password?: string;
}

export type AccountStatus = 'pending' | 'rejected' | 'suspended' | 'active' | 'inactive';

export interface AccountStatusResponse {
  status: AccountStatus;
  rejection_reason?: string;
  message: string;
}

// MFA/2FA Types
export interface MfaSetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
  issuer: string;
  account_name: string;
}

export interface MfaVerifyRequest {
  code: string;
}

export interface MfaStatusResponse {
  mfa_enabled: boolean;
  mfa_method: 'totp' | 'email' | null;
  backup_codes_remaining: number;
}

export interface MfaLoginResponse extends LoginResponse {
  mfa_required: boolean;
  mfa_token?: string;
}

export interface MfaVerifyLoginRequest {
  mfa_token: string;
  code: string;
}

// Email Verification Types
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  verified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  sent: boolean;
}
