import type { UserInfo } from './auth.types';

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
  remember_me?: boolean;
}

export interface SuperAdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
  must_change_password: boolean;
}

// ==================== Dashboard Types ====================

// Summary Cards
export interface PendingRegistrationsCard {
  count: number;
  urgent_count: number;
}

export interface TotalTenantsCard {
  count: number;
  active_count: number;
  suspended_count: number;
  growth_percent: number;
  new_this_month: number;
  new_last_month: number;
}

export interface ActiveUsersCard {
  total_users: number;
  active_users: number;
  currently_logged_in: number;
}

export interface SystemStatusCard {
  database_health: 'healthy' | 'degraded' | 'down';
  database_latency_ms: number;
  api_uptime_percent: number;
  last_backup_time?: string;
  disk_usage_percent?: number;
  memory_usage_mb?: number;
}

export interface DashboardSummary {
  pending_registrations: PendingRegistrationsCard;
  total_tenants: TotalTenantsCard;
  active_users: ActiveUsersCard;
  system_status: SystemStatusCard;
}

// Recent Activity
export interface RecentRegistration {
  tenant_id: string;
  shop_name: string;
  owner_name: string;
  owner_email: string;
  days_pending: number;
  is_urgent: boolean;
  created_at: string;
}

export interface RecentLogin {
  user_id: string;
  email: string;
  full_name: string;
  user_type: string;
  tenant_name?: string;
  ip_address: string;
  login_at: string;
}

export interface RecentApproval {
  tenant_id: string;
  shop_name: string;
  approved_by: string;
  approved_at: string;
}

export interface RecentActivity {
  recent_registrations: RecentRegistration[];
  recent_logins: RecentLogin[];
  recent_approvals: RecentApproval[];
}

// Full Dashboard Response
export interface DashboardFullResponse {
  summary: DashboardSummary;
  recent_activity: RecentActivity;
}

// Legacy support - map to new structure
export interface DashboardStats {
  pending_registrations: number;
  total_tenants: number;
  active_users: number;
  system_status: {
    database_healthy: boolean;
    api_uptime: number;
    last_backup?: string;
  };
}

// Tenant Statistics
export interface TenantStatistics {
  tenant_id: string;
  shop_name: string;
  total_users: number;
  active_users: number;
  total_products: number;
  total_sales_30_days: number;
  sales_count_30_days: number;
  database_size: string;
  database_bytes: number;
  storage_usage: string;
  storage_bytes: number;
  last_login_at?: string;
  created_at: string;
}

// Registration Detail
export interface OwnerInfo {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  email_verified: boolean;
  status: string;
  last_login_at?: string;
  last_login_ip?: string;
  created_at: string;
}

export interface RegistrationDetail {
  tenant_id: string;
  shop_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_vat_number?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  registration_status: string;
  rejection_reason?: string;
  approved_at?: string;
  rejected_at?: string;
  owner?: OwnerInfo;
  days_pending: number;
  is_urgent: boolean;
  registration_ip: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

// ==================== Backend Response Types ====================

// Go sql.NullString serializes as { String: "value", Valid: true/false }
export interface SqlNullString {
  String: string;
  Valid: boolean;
}

// Go sql.NullTime serializes similarly
export interface SqlNullTime {
  Time: string;
  Valid: boolean;
}

// Go uuid.NullUUID serializes similarly
export interface SqlNullUUID {
  UUID: string;
  Valid: boolean;
}

// Matches backend master.Tenant model (with Go null types)
export interface TenantData {
  id: string;
  shop_name: string;
  business_type: string;
  business_registration_number?: SqlNullString;
  tax_vat_number?: SqlNullString;
  address_line1: string;
  address_line2?: SqlNullString;
  city: string;
  postal_code?: SqlNullString;
  country: string;
  phone?: SqlNullString;
  email?: SqlNullString;
  schema_name?: SqlNullString;
  registration_status: string;
  rejection_reason?: SqlNullString;
  approved_by?: SqlNullUUID;
  approved_at?: SqlNullTime;
  rejected_by?: SqlNullUUID;
  rejected_at?: SqlNullTime;
  currency: string;
  timezone: string;
  language: string;
  logo_url?: SqlNullString;
  created_at: string;
  updated_at: string;
}

// Matches backend master.User model (owner info)
export interface UserData {
  id: string;
  tenant_id?: string;
  full_name: string;
  email: string;
  phone?: SqlNullString;
  profile_image_url?: SqlNullString;
  role: string;
  status: string;
  email_verified: boolean;
  last_login_at?: SqlNullTime;
  last_login_ip?: SqlNullString;
  created_at: string;
  updated_at: string;
}

// Backend RegistrationDetail response (nested structure)
export interface RegistrationDetailResponse {
  tenant: TenantData;
  owner: UserData | null;
}

// ==================== Frontend Display Types ====================

export interface Registration {
  id: string;
  shop_name: string;
  business_type: string;
  owner_name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  days_pending?: number;
  is_urgent?: boolean;
  details?: {
    business_registration_number?: string;
    tax_vat_number?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code?: string;
    country: string;
  };
}

export interface Tenant {
  id: string;
  shop_name: string;
  owner_name: string;
  email: string;
  schema_name?: string;
  status: 'active' | 'suspended' | 'pending' | 'rejected';
  created_at: string;
  last_active?: string;
  total_users?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action_type: string;
  user_email: string;
  description: string;
  ip_address: string;
  entity_type?: string;
  status: 'success' | 'failure';
  tenant_id?: string;
}
