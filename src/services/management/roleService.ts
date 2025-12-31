import { axiosInstance } from "../api/axiosInstance";
import type {
  Role,
  RoleFormData,
  RolePaginationParams,
  RoleResponse,
  Permission,
  PermissionModule,
} from "../../types/entities/role.types";

// Helper to transform backend permission response
const transformPermission = (p: any): Permission => ({
  id: p.id,
  code: p.code,
  name: p.name,
  module: p.module,
  description: p.description || undefined,
});

// Helper to transform backend role response to frontend Role type
const transformRole = (r: any): Role => ({
  id: r.id,
  name: r.name,
  description: r.description || undefined,
  isSystem: r.is_system || false,
  isActive: r.is_active !== false,
  userCount: r.user_count || 0,
  permissions: (r.permissions || []).map(transformPermission),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const roleService = {
  // Get all roles with pagination
  getRoles: async (params: RolePaginationParams): Promise<RoleResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || false,
      include_system: params.includeSystem !== false, // default true
    };

    const response = await axiosInstance.get("/admin/roles", { params: backendParams });

    const rolesData = response.data.roles || response.data.data || response.data || [];
    const roles: Role[] = Array.isArray(rolesData)
      ? rolesData.map(transformRole)
      : [];

    return {
      data: roles,
      total: response.data.total || roles.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || roles.length) / params.limit),
    };
  },

  // Get all roles (no pagination, for dropdowns)
  getAllRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get("/admin/roles", {
      params: { per_page: 100, include_system: true },
    });
    const rolesData = response.data.roles || response.data.data || response.data || [];
    return Array.isArray(rolesData) ? rolesData.map(transformRole) : [];
  },

  // Get role by ID
  getRoleById: async (id: string): Promise<Role> => {
    const response = await axiosInstance.get(`/admin/roles/${id}`);
    const roleData = response.data.role || response.data.data || response.data;
    return transformRole(roleData);
  },

  // Create role
  createRole: async (data: RoleFormData): Promise<Role> => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      is_active: data.isActive,
      permission_ids: data.permissionIds,
    };

    const response = await axiosInstance.post("/admin/roles", payload);
    const createdRole = response.data.role || response.data.data || response.data;
    return transformRole(createdRole);
  },

  // Update role
  updateRole: async (id: string, data: Partial<RoleFormData>): Promise<Role> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    if (data.permissionIds !== undefined) payload.permission_ids = data.permissionIds;

    const response = await axiosInstance.put(`/admin/roles/${id}`, payload);
    const updatedRole = response.data.role || response.data.data || response.data;
    return transformRole(updatedRole);
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/roles/${id}`);
  },

  // Assign permissions to role
  assignPermissions: async (id: string, permissionIds: string[]): Promise<void> => {
    await axiosInstance.put(`/admin/roles/${id}/permissions`, {
      permission_ids: permissionIds,
    });
  },

  // Get all permissions
  getPermissions: async (module?: string): Promise<Permission[]> => {
    const params = module ? { module } : undefined;
    const response = await axiosInstance.get("/admin/permissions", { params });
    const permissionsData = response.data.permissions || response.data.data || response.data || [];
    return Array.isArray(permissionsData) ? permissionsData.map(transformPermission) : [];
  },

  // Get permissions grouped by module
  getPermissionsByModule: async (): Promise<PermissionModule[]> => {
    const response = await axiosInstance.get("/admin/permissions");
    const permissionsData = response.data.permissions || response.data.data || response.data || [];

    // Group permissions by module
    const moduleMap = new Map<string, Permission[]>();
    permissionsData.forEach((p: any) => {
      const permission = transformPermission(p);
      const existing = moduleMap.get(permission.module) || [];
      existing.push(permission);
      moduleMap.set(permission.module, existing);
    });

    return Array.from(moduleMap.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  },

  // Export roles to PDF
  exportToPDF: async (params: RolePaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || false,
    };
    const response = await axiosInstance.get("/admin/roles/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export roles to Excel
  exportToExcel: async (params: RolePaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || false,
    };
    const response = await axiosInstance.get("/admin/roles/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
