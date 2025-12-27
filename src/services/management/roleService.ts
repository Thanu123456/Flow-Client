import api from '../api';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../types/entities/role.types';
import type { Permission } from '../../types/auth/permissions';

export const roleService = {
  async listRoles(): Promise<Role[]> {
    const response = await api.get<{ data: Role[] }>('/admin/roles');
    return response.data.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await api.get<{ data: Role }>(`/admin/roles/${id}`);
    return response.data.data;
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await api.post<{ data: Role }>('/admin/roles', data);
    return response.data.data;
  },

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await api.put<{ data: Role }>(`/admin/roles/${id}`, data);
    return response.data.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/admin/roles/${id}`);
  },

  async assignPermissions(id: string, permissions: string[]): Promise<void> {
    await api.put(`/admin/roles/${id}/permissions`, { permissions });
  },

  async listPermissions(): Promise<Permission[]> {
    const response = await api.get<{ data: Permission[] }>('/admin/permissions');
    return response.data.data;
  }
};
