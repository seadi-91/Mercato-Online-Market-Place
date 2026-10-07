import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { adminSettingsService } from "@/features/admin/services/admin.service";

export interface PlatformSettings {
  // Brand & Identity
  platformName: string;
  platformTagline: string;
  platformDescription: string;
  heroSectionDescription?: string;
  logoUrl: string;
  currency: string;
  timezone: string;

  // Footer & Contact
  footerEmail: string;
  contactPhone: string;
  secondaryPhone: string;
  headquartersAddress: string;
  copyrightText: string;
  telegramChannel: string;
  twitterHandle: string;
  linkedinHandle: string;
  facebookPage: string;

  // Escrow & Finance
  commissionRate: string;
  escrowHoldHours: string;
  maxWithdrawalLimit?: string;
  minPayoutThreshold?: string;

  // Gateways
  telebirrWebhook: boolean;
  telebirrShortCode: string;
  cbeBirrWebhook: boolean;
  chapaLiveMode: boolean;

  // KYC
  requireTin: boolean;
  requireTradeLicense: boolean;
  instantVerifyRiders: boolean;

  // Security
  maintenanceMode: boolean;
  require2FA: boolean;
  sessionTimeoutMinutes: string;
  maxLoginAttempts?: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: "MercatoX",
  platformTagline: "Unified Commerce & Order Control Center",
  platformDescription:
    "Ethiopia's premier multi-vendor commerce platform with 100% buyer protection, connecting verified local merchants with modern online shoppers.",
  heroSectionDescription:
    "Ethiopia's premier multi-vendor commerce platform with 100% buyer protection, connecting verified local merchants with modern online shoppers.",
  logoUrl: "",
  currency: "ETB",
  timezone: "Africa/Addis_Ababa",
  footerEmail: "support@mercatox.et",
  contactPhone: "+251 911 234 567",
  secondaryPhone: "+251 115 500 000",
  headquartersAddress: "Bole Medhanialem Commercial Plaza, Addis Ababa, Ethiopia",
  copyrightText: `© ${new Date().getFullYear()} MercatoX Inc. All rights reserved. Ethiopian Protected Commerce.`,
  telegramChannel: "https://t.me/mercatox_et",
  twitterHandle: "https://x.com/mercatox_et",
  linkedinHandle: "https://linkedin.com/company/mercatox-et",
  facebookPage: "https://facebook.com/mercatox.ethiopia",
  commissionRate: "3.50",
  escrowHoldHours: "48",
  maxLoginAttempts: "5",
  telebirrWebhook: true,
  telebirrShortCode: "892100",
  cbeBirrWebhook: true,
  chapaLiveMode: true,
  requireTin: true,
  requireTradeLicense: true,
  instantVerifyRiders: false,
  maintenanceMode: false,
  require2FA: true,
  sessionTimeoutMinutes: "60",
};

interface PlatformStoreState {
  settings: PlatformSettings;
  isLoading: boolean;
  isHydrated: boolean;
  setSettings: (partial: Partial<PlatformSettings>) => void;
  fetchSettings: () => Promise<void>;
  saveSettingsToBackend: (
    updated: Partial<PlatformSettings>
  ) => Promise<PlatformSettings>;
}

export const usePlatformStore = create<PlatformStoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_PLATFORM_SETTINGS,
      isLoading: false,
      isHydrated: false,

      setSettings: (partial: Partial<PlatformSettings>) => {
        set((state) => {
          const merged = { ...state.settings, ...partial };
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("mercatox:settings-updated", { detail: merged })
            );
          }
          return { settings: merged };
        });
      },

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const backendData = await adminSettingsService.getSettings();
          if (
            backendData &&
            typeof backendData === "object" &&
            Object.keys(backendData).length > 0
          ) {
            set((state) => ({
              settings: { ...state.settings, ...backendData },
              isLoading: false,
            }));
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("mercatox:settings-updated", {
                  detail: backendData,
                })
              );
            }
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      saveSettingsToBackend: async (updated: Partial<PlatformSettings>) => {
        set({ isLoading: true });
        const current = get().settings;
        const payload = { ...current, ...updated };
        try {
          const res = await adminSettingsService.updateSettings(payload);
          const finalSettings = { ...payload, ...res };
          set({ settings: finalSettings, isLoading: false });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("mercatox:settings-updated", {
                detail: finalSettings,
              })
            );
          }
          return finalSettings;
        } catch (err) {
          // Local fallback
          set({ settings: payload, isLoading: false });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("mercatox:settings-updated", { detail: payload })
            );
          }
          return payload;
        }
      },
    }),
    {
      name: "mercatox_platform_settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Background fetch from backend on rehydration
          state.fetchSettings().catch(() => null);
        }
      },
    }
  )
);
