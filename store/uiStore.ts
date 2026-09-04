import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SellerSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  offerExpiry: boolean;
  dispatchReminders: boolean;
  requireOtp: boolean;
  compactTables: boolean;
}

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  globalLoading: boolean;
  sellerSettings: SellerSettings;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarOpen: (value: boolean) => void;
  setGlobalLoading: (value: boolean) => void;
  updateSellerSettings: (data: Partial<SellerSettings>) => void;
}

const defaultSellerSettings: SellerSettings = {
  emailAlerts: true,
  smsAlerts: true,
  offerExpiry: true,
  dispatchReminders: true,
  requireOtp: true,
  compactTables: false,
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      globalLoading: false,
      sellerSettings: defaultSellerSettings,
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      setGlobalLoading: (value) => set({ globalLoading: value }),
      updateSellerSettings: (data) =>
        set((state) => ({
          sellerSettings: { ...state.sellerSettings, ...data },
        })),
    }),
    {
      name: "petrotrade-seller-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sellerSettings: state.sellerSettings,
      }),
    },
  ),
);
