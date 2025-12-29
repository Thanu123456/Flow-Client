import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo } from '../../types/auth/auth.types';
import type { DashboardStats } from '../../types/auth/superadmin.types';

interface SuperAdminState {
  // Auth state
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
  mfaVerified: boolean;

  // Dashboard state
  dashboardStats: DashboardStats | null;
  lastStatsUpdate: number | null;

  // UI state
  sidebarCollapsed: boolean;

  // Actions
  setAuth: (data: {
    token: string;
    user: UserInfo;
    mustChangePassword?: boolean;
    mfaEnabled?: boolean;
  }) => void;
  clearAuth: () => void;
  setMfaVerified: (verified: boolean) => void;
  setMustChangePassword: (value: boolean) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  mustChangePassword: false,
  mfaEnabled: false,
  mfaVerified: false,
  dashboardStats: null,
  lastStatsUpdate: null,
  sidebarCollapsed: false,
};

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (data) => {
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          mustChangePassword: data.mustChangePassword || false,
          mfaEnabled: data.mfaEnabled || false,
          mfaVerified: !data.mfaEnabled, // Auto-verified if MFA not enabled
        });

        // Sync to localStorage for API interceptor
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', 'super_admin');
        localStorage.setItem('isKiosk', 'false');
        localStorage.setItem('mustChangePassword', String(data.mustChangePassword || false));
      },

      clearAuth: () => {
        set({
          ...initialState,
          sidebarCollapsed: get().sidebarCollapsed, // Preserve UI preference
        });

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('role');
        localStorage.removeItem('isKiosk');
        localStorage.removeItem('mustChangePassword');
      },

      setMfaVerified: (verified) => {
        set({ mfaVerified: verified });
      },

      setMustChangePassword: (value) => {
        set({ mustChangePassword: value });
        localStorage.setItem('mustChangePassword', String(value));
      },

      setDashboardStats: (stats) => {
        set({
          dashboardStats: stats,
          lastStatsUpdate: Date.now(),
        });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
    }),
    {
      name: 'superadmin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        // Don't persist auth state - let it be loaded fresh on each session
      }),
    }
  )
);

// Selectors
export const selectIsAuthenticated = (state: SuperAdminState) => state.isAuthenticated;
export const selectUser = (state: SuperAdminState) => state.user;
export const selectMustChangePassword = (state: SuperAdminState) => state.mustChangePassword;
export const selectMfaEnabled = (state: SuperAdminState) => state.mfaEnabled;
export const selectMfaVerified = (state: SuperAdminState) => state.mfaVerified;
export const selectDashboardStats = (state: SuperAdminState) => state.dashboardStats;
export const selectSidebarCollapsed = (state: SuperAdminState) => state.sidebarCollapsed;

// Helper to check if stats need refresh (older than 5 minutes)
export const selectStatsNeedRefresh = (state: SuperAdminState): boolean => {
  if (!state.lastStatsUpdate) return true;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - state.lastStatsUpdate > fiveMinutes;
};

export default useSuperAdminStore;
