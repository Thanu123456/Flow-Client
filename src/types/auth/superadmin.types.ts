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

export interface Registration {
  id: string;
  shop_name: string;
  business_type: string;
  owner_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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
  schema_name: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  last_active?: string;
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
