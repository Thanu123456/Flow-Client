import type { TenantInfo } from './auth.types';

export interface KioskLoginRequest {
  user_id: string;
  pin: string;
}

export interface KioskUserInfo {
  id: string;
  user_id: string;
  full_name: string;
  profile_image_url?: string;
  role?: string;
}

export interface KioskLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: KioskUserInfo;
  tenant: TenantInfo;
  session_id: string;
  shift_started: string;
  must_change_pin: boolean;
}

export interface KioskEndShiftResponse {
  total_sales: number;
  total_transactions: number;
  shift_duration: string;
  shift_started: string;
  shift_ended: string;
}
