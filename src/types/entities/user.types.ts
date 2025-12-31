export interface User {
  id: string;
  userId?: string; // Custom user ID for kiosk (e.g., EMP001)
  email: string;
  phone?: string;
  fullName: string;
  profileImageUrl?: string;
  userType: 'super_admin' | 'owner' | 'employee';
  status: 'active' | 'inactive' | 'locked' | 'pending';
  roleId?: string;
  roleName?: string;
  warehouseId?: string;
  warehouseName?: string;
  kioskEnabled: boolean;
  maxDiscountPercent?: number;
  mustChangePassword: boolean;
  mustChangePin: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface UserFormData {
  fullName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  roleId: string;
  warehouseId?: string;
  password?: string;
  confirmPassword?: string;
  kioskEnabled: boolean;
  userId?: string;
  pin?: string;
  confirmPin?: string;
  maxDiscountPercent?: number;
  status: 'active' | 'inactive';
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone: string;
  profile_image_url?: string;
  role_id: string;
  warehouse_id?: string;
  password: string;
  confirm_password: string;
  kiosk_enabled: boolean;
  user_id?: string;
  pin?: string;
  confirm_pin?: string;
  max_discount_percent?: number;
  status?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  profile_image_url?: string;
  role_id?: string;
  warehouse_id?: string;
  kiosk_enabled?: boolean;
  max_discount_percent?: number;
  status?: string;
}

export interface ResetPINRequest {
  new_pin: string;
  confirm_new_pin: string;
}

export interface ChangePasswordAdminRequest {
  new_password: string;
  confirm_new_password: string;
}

export interface BulkUserActionRequest {
  user_ids: string[];
  action: 'activate' | 'deactivate' | 'delete';
}

export interface BulkActionResult {
  userId: string;
  email: string;
  success: boolean;
  error?: string;
}

export interface BulkActionResponse {
  totalRequested: number;
  successful: number;
  failed: number;
  results: BulkActionResult[];
}

export interface UserFilters {
  search?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'locked';
}

export interface UserPaginationParams {
  page: number;
  limit: number;
  search?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'locked';
}

export interface UserResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
