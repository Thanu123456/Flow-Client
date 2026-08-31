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

  // POS settings and business profile load independently — one failing
  // must not blank the other.
  settingsLoading: boolean;
  settingsError: string | null;
  profileLoading: boolean;
  profileError: string | null;
  saving: boolean;

  fetchSettings: () => Promise<void>;
  saveSettings: (update: PosSettingsUpdate) => Promise<void>;
  fetchBusinessProfile: () => Promise<void>;
  saveBusinessProfile: (update: BusinessProfileUpdate) => Promise<void>;
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
      settingsLoading: false,
      settingsError: null,
      profileLoading: false,
      profileError: null,
      saving: false,

      fetchSettings: async () => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const settings = await settingsService.getSettings();
          set({ settings, settingsLoading: false });
        } catch (e: any) {
          set({ settingsError: msg(e, "Failed to load settings"), settingsLoading: false });
        }
      },

      saveSettings: async (update) => {
        set({ saving: true });
        try {
          const settings = await settingsService.updateSettings(update);
          set({ settings, saving: false });
        } catch (e: any) {
          set({ saving: false });
          throw e;
        }
      },

      fetchBusinessProfile: async () => {
        set({ profileLoading: true, profileError: null });
        try {
          const businessProfile = await settingsService.getBusinessProfile();
          set({ businessProfile, profileLoading: false });
        } catch (e: any) {
          set({ profileError: msg(e, "Failed to load business profile"), profileLoading: false });
        }
      },

      saveBusinessProfile: async (update) => {
        set({ saving: true });
        try {
          const businessProfile = await settingsService.updateBusinessProfile(update);
          set({ businessProfile, saving: false });
        } catch (e: any) {
          set({ saving: false });
          throw e;
        }
      },
    }),
    { name: "settings-store" }
  )
);
