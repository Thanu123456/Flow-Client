import { getStoredTenant, getStoredUser, getStoredToken, getTokenData } from './authMiddleware';
import type { TenantInfo, UserInfo } from '../types/auth/auth.types';

/**
 * Get the current tenant's schema name
 */
export const getTenantSchema = (): string | null => {
  const tenant = getStoredTenant<TenantInfo>();
  if (tenant?.schema_name) return tenant.schema_name;

  // Fallback to token data
  const token = getStoredToken();
  const tokenData = getTokenData(token);
  return tokenData?.schema_name as string || null;
};

/**
 * Get the current tenant ID
 */
export const getTenantId = (): string | null => {
  const tenant = getStoredTenant<TenantInfo>();
  if (tenant?.id) return tenant.id;

  // Fallback to token data
  const token = getStoredToken();
  const tokenData = getTokenData(token);
  return tokenData?.tenant_id as string || null;
};

/**
 * Get the current tenant info
 */
export const getTenantInfo = (): TenantInfo | null => {
  return getStoredTenant<TenantInfo>();
};

/**
 * Check if user belongs to a tenant (not super admin)
 */
export const hasTenant = (): boolean => {
  return getTenantId() !== null;
};

/**
 * Get tenant registration status
 */
export const getTenantStatus = (): string | null => {
  const tenant = getTenantInfo();
  return tenant?.registration_status || null;
};

/**
 * Check if tenant is active
 */
export const isTenantActive = (): boolean => {
  const status = getTenantStatus();
  return status === 'active';
};

/**
 * Get tenant display name (shop name)
 */
export const getTenantName = (): string | null => {
  const tenant = getTenantInfo();
  return tenant?.shop_name || null;
};

/**
 * Get tenant business type
 */
export const getTenantBusinessType = (): string | null => {
  const tenant = getTenantInfo();
  return tenant?.business_type || null;
};

/**
 * Get tenant currency
 */
export const getTenantCurrency = (): string => {
  const tenant = getTenantInfo();
  return tenant?.currency || 'LKR';
};

/**
 * Get tenant timezone
 */
export const getTenantTimezone = (): string => {
  const tenant = getTenantInfo();
  return tenant?.timezone || 'Asia/Colombo';
};

/**
 * Get tenant logo URL
 */
export const getTenantLogo = (): string | null => {
  const tenant = getTenantInfo();
  return tenant?.logo_url || null;
};

/**
 * Format currency value for current tenant
 */
export const formatTenantCurrency = (value: number): string => {
  const currency = getTenantCurrency();
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Format date for current tenant timezone
 */
export const formatTenantDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const timezone = getTenantTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('en-US', {
    timeZone: timezone,
    ...options,
  });
};

/**
 * Get current user's info
 */
export const getCurrentUser = (): UserInfo | null => {
  return getStoredUser<UserInfo>();
};

/**
 * Get current user's full name
 */
export const getCurrentUserName = (): string | null => {
  const user = getCurrentUser();
  return user?.full_name || null;
};

/**
 * Get current user's email
 */
export const getCurrentUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user?.email || null;
};

/**
 * Check if current user has kiosk enabled
 */
export const isKioskEnabled = (): boolean => {
  const user = getCurrentUser();
  return user?.kiosk_enabled || false;
};

/**
 * Build tenant-aware API headers
 */
export const getTenantHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  const tenantId = getTenantId();
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }

  const schema = getTenantSchema();
  if (schema) {
    headers['X-Schema-Name'] = schema;
  }

  return headers;
};
