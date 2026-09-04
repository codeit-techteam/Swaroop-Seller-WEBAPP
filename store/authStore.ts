import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { sellerProfileMock } from "@/lib/mock/locations";
import { storage } from "@/lib/utils";
import type { AuthState, AuthTokens, User } from "@/types/auth";

const demoUser: User = {
  id: CURRENT_USER.id,
  email: CURRENT_USER.email,
  name: CURRENT_USER.name,
  role: "SELLER",
  company: CURRENT_USER.company,
  sellerId: CURRENT_USER.sellerId,
};

interface SellerAuthState extends AuthState {
  onboardingComplete: boolean;
  pendingMobile: string;
  hasHydrated: boolean;
  setPendingMobile: (mobile: string) => void;
  verifyOtp: (otp: string) => Promise<{ ok: boolean; message?: string }>;
  completeOnboarding: () => void;
  setSession: (user: User, tokens?: AuthTokens | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<SellerAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      onboardingComplete: false,
      pendingMobile: "",
      hasHydrated: false,
      setPendingMobile: (mobile) => set({ pendingMobile: mobile }),
      verifyOtp: async (otp) => {
        set({ isLoading: true });
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        const valid = otp === "123456" || /^\d{6}$/.test(otp);
        if (!valid) {
          set({ isLoading: false });
          return { ok: false, message: "Invalid OTP. Use 123456 for demo." };
        }

        const mobile = get().pendingMobile || sellerProfileMock.mobile;
        const user: User = {
          ...demoUser,
          email: sellerProfileMock.email,
          name: sellerProfileMock.contactPerson,
          company: sellerProfileMock.companyName,
        };

        set({
          user,
          tokens: {
            accessToken: "mock-seller-token",
            refreshToken: "mock-seller-refresh",
          },
          isAuthenticated: true,
          isLoading: false,
          pendingMobile: mobile,
        });
        storage.set(STORAGE_KEYS.AUTH_TOKEN, "mock-seller-token");
        return { ok: true };
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      setSession: (user, tokens = null) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          pendingMobile: "",
        });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.AUTH_SESSION,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
        pendingMobile: state.pendingMobile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export { ROLE_LABELS };
