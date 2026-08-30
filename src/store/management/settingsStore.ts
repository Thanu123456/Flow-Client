import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { settingsService } from "../../services/management/settingsService";
import type {
  BusinessProfile,
  BusinessProfileUpdate,
  PosSettings,
  PosSettingsUpdate,
} from "../../types/entities/settings.types";

interface SettingsState {
  settings: PosSettings | null;
  businessProfile: BusinessProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  saveSettings: (update: PosSettingsUpdate) => Promise<void>;
  fetchBusinessProfile: () => Promise<void>;
  saveBusinessProfile: (update: BusinessProfileUpdate) => Promise<void>;
  clearError: () => void;
}

const msg = (e: any, fallback: string) =>
  e?.response?.data?.error?.message ||
  e?.response?.data?.message ||
  e?.message ||
  fallback;

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set) => ({
      settings: null,
      businessProfile: null,
      loading: false,
      saving: false,
      error: null,

      fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
          const settings = await settingsService.getSettings();
          set({ settings, loading: false });
        } catch (e: any) {
          set({ error: msg(e, "Failed to load settings"), loading: false });
        }
      },

      saveSettings: async (update) => {
        set({ saving: true, error: null });
        try {
          const settings = await settingsService.updateSettings(update);
          set({ settings, saving: false });
        } catch (e: any) {
          set({ error: msg(e, "Failed to save settings"), saving: false });
          throw e;
        }
      },

      fetchBusinessProfile: async () => {
        set({ loading: true, error: null });
        try {
          const businessProfile = await settingsService.getBusinessProfile();
          set({ businessProfile, loading: false });
        } catch (e: any) {
          set({ error: msg(e, "Failed to load business profile"), loading: false });
        }
      },

      saveBusinessProfile: async (update) => {
        set({ saving: true, error: null });
        try {
          const businessProfile = await settingsService.updateBusinessProfile(update);
          set({ businessProfile, saving: false });
        } catch (e: any) {
          set({ error: msg(e, "Failed to save business profile"), saving: false });
          throw e;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "settings-store" }
  )
);
