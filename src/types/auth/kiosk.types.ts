import type { TenantInfo } from './auth.types';

export interface KioskLoginRequest {
  user_id: string;
  pin: string;
  // Cash counted into the drawer at the start of the shift — only used when
  // this login actually starts a new shift, not when resuming an active one.
  opening_cash?: number;
  opening_denomination?: string; // JSON string, e.g. {"5000":2,"1000":5}
}

export interface KioskUserInfo {
  id: string;
  user_id: string;
  full_name: string;
  profile_image_url?: string;
  role?: string;
  permissions?: string[];
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
  session_id: string;
  user_id: string;
  shift_started_at: string;
  shift_ended_at?: string;
  total_sales: number;
  total_transactions: number;
  total_cash_sales: number;
  total_card_sales: number;
  total_refunds: number;
  total_cash_paid_out: number;
  // Cash-drawer reconciliation.
  opening_cash: number;
  opening_denomination?: string;
  closing_cash?: number;
  closing_denomination?: string;
  expected_cash: number;
  variance?: number; // closing_cash - expected_cash; positive = over, negative = short
}

// Returned by POST /kiosk/resolve-store — the minimal, unauthenticated shop
// info a fresh kiosk device needs to brand itself to a tenant before anyone
// has logged in.
export interface KioskStoreInfo {
  tenant_id: string;
  shop_name: string;
  logo_url?: string;
}

// Returned by POST /kiosk/authorize-override — a manager approving a
// restricted POS action (discount, refund) the signed-in cashier's own role
// can't authorize on its own. `token` gets attached to the sale/return it was
// requested for.
export interface OverrideAuthorization {
  token: string;
  expires_in: number;
  authorized_by: string;
}

export interface KioskSessionInfo {
  id: string;
  user_id: string;
  shift_started_at: string;
  shift_ended_at?: string;
  total_sales: number;
  total_transactions: number;
  is_active: boolean;
}

// GET /kiosk/shift-insights — the manager-facing view of a shift beyond the
// plain cash summary: hourly trend, best sellers, and cashier-driven-action
// counts (discounts, refunds) worth a second look.
export interface ShiftHourlyBucket {
  hour: number;
  total: number;
  count: number;
}

export interface ShiftTopItem {
  name: string;
  quantity: number;
  total: number;
}

export interface ShiftActivityCounts {
  discount_count: number;
  discount_total: number;
  refund_count: number;
}

export interface ShiftInsights {
  hourly_breakdown: ShiftHourlyBucket[];
  top_items: ShiftTopItem[];
  activity: ShiftActivityCounts;
}
