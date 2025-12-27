import api from '../api';
import type { 
  DashboardStats, 
  Registration, 
  Tenant, 
  AuditLog 
} from '../../types/auth/superadmin.types';

export const superAdminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<{ data: DashboardStats }>('/superadmin/dashboard');
    return response.data.data;
  },

  // Registrations
  async listPendingRegistrations(page = 1, perPage = 10): Promise<{ registrations: Registration[], total: number }> {
    const response = await api.get('/superadmin/registrations', { params: { page, per_page: perPage } });
    // Assuming backend uses common.Paginated format
    return {
      registrations: response.data.data,
      total: response.data.total
    };
  },

  async getRegistration(id: string): Promise<Registration> {
    const response = await api.get<{ data: Registration }>(`/superadmin/registrations/${id}`);
    return response.data.data;
  },

  async approveRegistration(id: string): Promise<void> {
    await api.post(`/superadmin/registrations/${id}/approve`);
  },

  async rejectRegistration(id: string, reason: string): Promise<void> {
    await api.post(`/superadmin/registrations/${id}/reject`, { reason });
  },

  // Tenants
  async listTenants(page = 1, perPage = 10, status?: string): Promise<{ tenants: Tenant[], total: number }> {
    const response = await api.get('/superadmin/tenants', { params: { page, per_page: perPage, status } });
    return {
      tenants: response.data.data,
      total: response.data.total
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
