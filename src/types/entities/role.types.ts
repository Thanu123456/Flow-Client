export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface PermissionModule {
  module: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  isActive: boolean;
  permissionIds: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface AssignPermissionsRequest {
  permission_ids: string[];
}

export interface RoleFilters {
  search?: string;
  includeInactive?: boolean;
  includeSystem?: boolean;
}

export interface RolePaginationParams {
  page: number;
  limit: number;
  search?: string;
  includeInactive?: boolean;
  includeSystem?: boolean;
}

export interface RoleResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
