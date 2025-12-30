import api from '../../utils/api';
import type {
  DashboardStats,
  DashboardFullResponse,
  DashboardSummary,
  RecentActivity,
  TenantStatistics,
  RegistrationDetail,
  RegistrationDetailResponse,
  Registration,
  Tenant,
  AuditLog,
  SqlNullString,
  SqlNullTime
} from '../../types/auth/superadmin.types';

// Helper to extract value from Go sql.NullString
const getNullString = (val: SqlNullString | string | null | undefined): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'Valid' in val && 'String' in val) {
    return val.Valid ? val.String : undefined;
  }
  return undefined;
};

// Helper to extract value from Go sql.NullTime
const getNullTime = (val: SqlNullTime | string | null | undefined): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'Valid' in val && 'Time' in val) {
    return val.Valid ? val.Time : undefined;
  }
  return undefined;
};

// Helper to transform backend nested response to flat Registration
const transformToRegistration = (item: RegistrationDetailResponse): Registration => {
  const { tenant, owner } = item;
  return {
    id: tenant.id,
    shop_name: tenant.shop_name,
    business_type: tenant.business_type,
    owner_name: owner?.full_name || 'Unknown',
    email: owner?.email || getNullString(tenant.email) || '',
    phone: getNullString(owner?.phone) || getNullString(tenant.phone),
    status: tenant.registration_status as 'pending' | 'approved' | 'rejected',
    created_at: tenant.created_at,
    details: {
      business_registration_number: getNullString(tenant.business_registration_number),
      tax_vat_number: getNullString(tenant.tax_vat_number),
      address_line1: tenant.address_line1,
      address_line2: getNullString(tenant.address_line2),
      city: tenant.city,
      postal_code: getNullString(tenant.postal_code),
      country: tenant.country,
    }
  };
};

// Helper to transform backend nested response to flat Tenant
const transformToTenant = (item: RegistrationDetailResponse): Tenant => {
  const { tenant, owner } = item;
  return {
    id: tenant.id,
    shop_name: tenant.shop_name,
    owner_name: owner?.full_name || 'Unknown',
    email: owner?.email || getNullString(tenant.email) || '',
    schema_name: getNullString(tenant.schema_name),
    status: tenant.registration_status as 'active' | 'suspended' | 'pending' | 'rejected',
    created_at: tenant.created_at,
    last_active: getNullTime(owner?.last_login_at),
  };
};

export const superAdminService = {
  // Dashboard - Full (combined summary + activity)
  async getFullDashboard(): Promise<DashboardFullResponse> {
    const response = await api.get<{ data: DashboardFullResponse }>('/superadmin/dashboard');
    return response.data.data;
  },

  // Dashboard - Summary only
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<{ data: DashboardSummary }>('/superadmin/dashboard/summary');
    return response.data.data;
  },

  // Dashboard - Recent Activity only
  async getRecentActivity(): Promise<RecentActivity> {
    const response = await api.get<{ data: RecentActivity }>('/superadmin/dashboard/activity');
    return response.data.data;
  },

  // Legacy support
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<{ data: DashboardStats }>('/superadmin/dashboard');
    return response.data.data;
  },

  // Tenant Statistics
  async getTenantStatistics(tenantId: string): Promise<TenantStatistics> {
    const response = await api.get<{ data: TenantStatistics }>(`/superadmin/tenants/${tenantId}/statistics`);
    return response.data.data;
  },

  // Registration Detail
  async getRegistrationDetail(registrationId: string): Promise<RegistrationDetail> {
    const response = await api.get<{ data: RegistrationDetail }>(`/superadmin/registrations/${registrationId}/detail`);
    return response.data.data;
  },

  // Registrations - transforms nested backend response to flat structure
  async listPendingRegistrations(page = 1, perPage = 10): Promise<{ registrations: Registration[], total: number }> {
    const response = await api.get<{ data: RegistrationDetailResponse[], total: number }>('/superadmin/registrations', { params: { page, per_page: perPage } });
    const rawData = response.data.data || [];
    return {
      registrations: rawData.map(transformToRegistration),
      total: response.data.total || 0
    };
  },

  async getRegistration(id: string): Promise<Registration> {
    const response = await api.get<{ data: RegistrationDetailResponse }>(`/superadmin/registrations/${id}`);
    return transformToRegistration(response.data.data);
  },

  async approveRegistration(id: string): Promise<void> {
    await api.post(`/superadmin/registrations/${id}/approve`);
  },

  async rejectRegistration(id: string, reason: string): Promise<void> {
    await api.post(`/superadmin/registrations/${id}/reject`, { reason });
  },

  // Tenants - transforms nested backend response to flat structure
  async listTenants(page = 1, perPage = 10, status?: string): Promise<{ tenants: Tenant[], total: number }> {
    const response = await api.get<{ data: RegistrationDetailResponse[], total: number }>('/superadmin/tenants', { params: { page, per_page: perPage, status } });
    const rawData = response.data.data || [];
    return {
      tenants: rawData.map(transformToTenant),
      total: response.data.total || 0
    };
  },

  async suspendTenant(id: string, reason: string): Promise<void> {
    await api.post(`/superadmin/tenants/${id}/suspend`, { reason });
  },

  async activateTenant(id: string): Promise<void> {
    await api.post(`/superadmin/tenants/${id}/activate`);
  },

  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/superadmin/tenants/${id}`);
  },

  // Audit Logs
  async listAuditLogs(page = 1, perPage = 20): Promise<{ logs: AuditLog[], total: number }> {
    const response = await api.get('/superadmin/audit-logs', { params: { page, per_page: perPage } });
    return {
      logs: response.data.data,
      total: response.data.total
    };
  }
};
