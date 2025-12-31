import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { userService } from "../../services/management/userService";
import type {
  User,
  UserFormData,
  UserPaginationParams,
  ResetPINRequest,
  BulkUserActionRequest,
  BulkActionResponse,
} from "../../types/entities/user.types";

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getUsers: (params: UserPaginationParams) => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPIN: (id: string, data: ResetPINRequest) => Promise<void>;
  bulkAction: (data: BulkUserActionRequest) => Promise<BulkActionResponse>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      users: [],
      selectedUser: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getUsers: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await userService.getUsers(params);
          set({
            users: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch users",
            loading: false,
          });
        }
      },

      getUserById: async (id) => {
        set({ loading: true, error: null });
        try {
          const user = await userService.getUserById(id);
          set({ selectedUser: user, loading: false });
          return user;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch user",
            loading: false,
          });
          throw error;
        }
      },

      createUser: async (data) => {
        set({ loading: true, error: null });
        try {
          await userService.createUser(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create user",
            loading: false,
          });
          throw error;
        }
      },

      updateUser: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await userService.updateUser(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update user",
            loading: false,
          });
          throw error;
        }
      },

      deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
          await userService.deleteUser(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete user",
            loading: false,
          });
          throw error;
        }
      },

      resetPIN: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await userService.resetPIN(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to reset PIN",
            loading: false,
          });
          throw error;
        }
      },

      bulkAction: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await userService.bulkAction(data);
          set({ loading: false });
          return response;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to perform bulk action",
            loading: false,
          });
          throw error;
        }
      },

      setSelectedUser: (user) => set({ selectedUser: user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "user-store",
    }
  )
);
