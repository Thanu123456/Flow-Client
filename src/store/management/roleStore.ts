import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { roleService } from "../../services/management/roleService";
import type {
  Role,
  RoleFormData,
  RolePaginationParams,
  Permission,
  PermissionModule,
} from "../../types/entities/role.types";

interface RoleState {
  roles: Role[];
  allRoles: Role[];
  selectedRole: Role | null;
  permissions: Permission[];
  permissionModules: PermissionModule[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getRoles: (params: RolePaginationParams) => Promise<void>;
  getAllRoles: () => Promise<Role[]>;
  getRoleById: (id: string) => Promise<Role>;
  createRole: (data: RoleFormData) => Promise<void>;
  updateRole: (id: string, data: Partial<RoleFormData>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignPermissions: (id: string, permissionIds: string[]) => Promise<void>;
  getPermissions: () => Promise<Permission[]>;
  getPermissionsByModule: () => Promise<PermissionModule[]>;
  setSelectedRole: (role: Role | null) => void;
  clearError: () => void;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set) => ({
      roles: [],
      allRoles: [],
      selectedRole: null,
      permissions: [],
      permissionModules: [],
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getRoles: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await roleService.getRoles(params);
          set({
            roles: response.data,
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
            error: error.response?.data?.message || "Failed to fetch roles",
            loading: false,
          });
        }
      },

      getAllRoles: async () => {
        try {
          const roles = await roleService.getAllRoles();
          set({ allRoles: roles });
          return roles;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch roles";
          set({ error: errorMessage });
          return [];
        }
      },

      getRoleById: async (id) => {
        set({ loading: true, error: null });
        try {
          const role = await roleService.getRoleById(id);
          set({ selectedRole: role, loading: false });
          return role;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch role",
            loading: false,
          });
          throw error;
        }
      },

      createRole: async (data) => {
        set({ loading: true, error: null });
        try {
          await roleService.createRole(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create role",
            loading: false,
          });
          throw error;
        }
      },

      updateRole: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await roleService.updateRole(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update role",
            loading: false,
          });
          throw error;
        }
      },

      deleteRole: async (id) => {
        set({ loading: true, error: null });
        try {
          await roleService.deleteRole(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete role",
            loading: false,
          });
          throw error;
        }
      },

      assignPermissions: async (id, permissionIds) => {
        set({ loading: true, error: null });
        try {
          await roleService.assignPermissions(id, permissionIds);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to assign permissions",
            loading: false,
          });
          throw error;
        }
      },

      getPermissions: async () => {
        try {
          const permissions = await roleService.getPermissions();
          set({ permissions });
          return permissions;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch permissions";
          set({ error: errorMessage });
          return [];
        }
      },

      getPermissionsByModule: async () => {
        try {
          const permissionModules = await roleService.getPermissionsByModule();
          set({ permissionModules });
          return permissionModules;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch permissions";
          set({ error: errorMessage });
          return [];
        }
      },

      setSelectedRole: (role) => set({ selectedRole: role }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "role-store",
    }
  )
);
