import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo, TenantInfo } from '../../types/auth/auth.types';

interface AuthState {
  // Auth state
  token: string | null;
  user: UserInfo | null;
  tenant: TenantInfo | null;
  role: string | null;
  isKiosk: boolean;
  mustChangePassword: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (data: {
    token: string;
    user: UserInfo;
    tenant?: TenantInfo | null;
    role: string;
    isKiosk?: boolean;
    mustChangePassword?: boolean;
  }) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserInfo>) => void;
  updateTenant: (tenant: Partial<TenantInfo>) => void;
  setMustChangePassword: (value: boolean) => void;
}

const initialState = {
  token: null,
  user: null,
  tenant: null,
  role: null,
  isKiosk: false,
  mustChangePassword: false,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (data) => {
        set({
          token: data.token,
          user: data.user,
          tenant: data.tenant || null,
          role: data.role,
          isKiosk: data.isKiosk || false,
          mustChangePassword: data.mustChangePassword || false,
          isAuthenticated: true,
        });

        // Also sync to localStorage for API interceptor
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        localStorage.setItem('isKiosk', String(data.isKiosk || false));
        localStorage.setItem('mustChangePassword', String(data.mustChangePassword || false));
        if (data.tenant) {
          localStorage.setItem('tenant', JSON.stringify(data.tenant));
        }
      },

      clearAuth: () => {
        set(initialState);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('role');
        localStorage.removeItem('isKiosk');
        localStorage.removeItem('mustChangePassword');
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },

      updateTenant: (tenantData) => {
        const currentTenant = get().tenant;
        if (currentTenant) {
          const updatedTenant = { ...currentTenant, ...tenantData };
          set({ tenant: updatedTenant });
          localStorage.setItem('tenant', JSON.stringify(updatedTenant));
        }
      },

      setMustChangePassword: (value) => {
        set({ mustChangePassword: value });
        localStorage.setItem('mustChangePassword', String(value));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        tenant: state.tenant,
        role: state.role,
        isKiosk: state.isKiosk,
        mustChangePassword: state.mustChangePassword,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for common use cases
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectTenant = (state: AuthState) => state.tenant;
export const selectRole = (state: AuthState) => state.role;
export const selectIsKiosk = (state: AuthState) => state.isKiosk;
export const selectMustChangePassword = (state: AuthState) => state.mustChangePassword;

export default useAuthStore;
