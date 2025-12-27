

export interface PermissionEntity {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: PermissionEntity[];
  user_count?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[]; // Codes
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}
