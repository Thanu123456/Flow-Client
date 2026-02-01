import { axiosInstance } from "../api/axiosInstance";
import type {
  User,
  UserFormData,
  UserPaginationParams,
  UserResponse,
  ResetPINRequest,
  BulkUserActionRequest,
  BulkActionResponse,
} from "../../types/entities/user.types";

// Helper to transform backend user response to frontend User type
const transformUser = (u: any): User => ({
  id: u.id,
  userId: u.user_id || undefined,
  email: u.email,
  phone: u.phone || undefined,
  fullName: u.full_name,
  profileImageUrl: u.profile_image_url || undefined,
  userType: u.user_type,
  status: u.status,
  roleId: u.role_id || undefined,
  roleName: u.role_name || undefined,
  warehouseId: u.warehouse_id || undefined,
  warehouseName: u.warehouse_name || undefined,
  kioskEnabled: u.kiosk_enabled || false,
  maxDiscountPercent: u.max_discount_percent || undefined,
  mustChangePassword: u.must_change_password || false,
  mustChangePin: u.must_change_pin || false,
  emailVerified: u.email_verified || false,
  lastLoginAt: u.last_login_at || undefined,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
  permissions: u.permissions || undefined,
});

// Helper to transform bulk action response
const transformBulkActionResponse = (r: any): BulkActionResponse => ({
  totalRequested: r.total_requested,
  successful: r.successful,
  failed: r.failed,
  results: (r.results || []).map((res: any) => ({
    userId: res.user_id,
    email: res.email,
    success: res.success,
    error: res.error,
  })),
});

export const userService = {
  // Get all users with pagination
  getUsers: async (params: UserPaginationParams): Promise<UserResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      role_id: params.roleId || undefined,
      status: params.status || undefined,
    };

    const response = await axiosInstance.get("/admin/users", { params: backendParams });

    const usersData = response.data.users || response.data.data || response.data || [];
    const users: User[] = Array.isArray(usersData)
      ? usersData.map(transformUser)
      : [];

    return {
      data: users,
      total: response.data.total || users.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || users.length) / params.limit),
    };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    const userData = response.data.user || response.data.data || response.data;
    return transformUser(userData);
  },

  // Create user
  createUser: async (data: UserFormData): Promise<User> => {
    const payload: any = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      profile_image_url: data.profileImageUrl || undefined,
      role_id: data.roleId,
      warehouse_id: data.warehouseId || undefined,
      password: data.password,
      confirm_password: data.confirmPassword,
      kiosk_enabled: data.kioskEnabled,
      user_id: data.kioskEnabled ? data.userId : undefined,
      pin: data.kioskEnabled ? data.pin : undefined,
      confirm_pin: data.kioskEnabled ? data.confirmPin : undefined,
      max_discount_percent: data.maxDiscountPercent || undefined,
      status: data.status,
    };

    const response = await axiosInstance.post("/admin/users", payload);
    const createdUser = response.data.user || response.data.data || response.data;
    return transformUser(createdUser);
  },

  // Update user
  updateUser: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const payload: any = {};
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.profileImageUrl !== undefined) payload.profile_image_url = data.profileImageUrl;
    if (data.roleId !== undefined) payload.role_id = data.roleId;
    if (data.warehouseId !== undefined) payload.warehouse_id = data.warehouseId;
    if (data.kioskEnabled !== undefined) payload.kiosk_enabled = data.kioskEnabled;
    if (data.maxDiscountPercent !== undefined) payload.max_discount_percent = data.maxDiscountPercent;
    if (data.status !== undefined) payload.status = data.status;

    const response = await axiosInstance.put(`/admin/users/${id}`, payload);
    const updatedUser = response.data.user || response.data.data || response.data;
    return transformUser(updatedUser);
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },

  // Reset user PIN
  resetPIN: async (id: string, data: ResetPINRequest): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/reset-pin`, {
      new_pin: data.new_pin,
      confirm_new_pin: data.confirm_new_pin,
    });
  },

  // Bulk action on users
  bulkAction: async (data: BulkUserActionRequest): Promise<BulkActionResponse> => {
    const response = await axiosInstance.post("/admin/users/bulk-action", {
      user_ids: data.user_ids,
      action: data.action,
    });
    return transformBulkActionResponse(response.data);
  },

  // Export users to PDF
  exportToPDF: async (params: UserPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      role_id: params.roleId || undefined,
      status: params.status || undefined,
    };
    const response = await axiosInstance.get("/admin/users/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export users to Excel
  exportToExcel: async (params: UserPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      role_id: params.roleId || undefined,
      status: params.status || undefined,
    };
    const response = await axiosInstance.get("/admin/users/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },

  // Get user activity log
  getUserActivity: async (
    userId: string,
    params: { page: number; limit: number }
  ): Promise<{
    data: Array<{
      id: string;
      action: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
    };
    const response = await axiosInstance.get(`/admin/users/${userId}/activity`, {
      params: backendParams,
    });

    const activitiesData = response.data.activities || response.data.data || response.data || [];
    const activities = Array.isArray(activitiesData)
      ? activitiesData.map((a: any) => ({
          id: a.id,
          action: a.action,
          description: a.description,
          ipAddress: a.ip_address || a.ipAddress,
          userAgent: a.user_agent || a.userAgent,
          createdAt: a.created_at || a.createdAt,
        }))
      : [];

    return {
      data: activities,
      total: response.data.total || activities.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
    };
  },
};
