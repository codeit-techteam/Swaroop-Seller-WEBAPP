import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { sellerProfileMock } from "@/lib/mock/locations";
import { storage } from "@/lib/utils";
import { apiClient } from "@/services/apiClient";
import type { AuthState, AuthTokens, User } from "@/types/auth";

const DEMO_OTP = "123456";
const DEMO_PHONE = "8240890242";
const DEMO_SELLER_EMAIL = "seller@test.local";
const DEMO_PASSWORD = "Test@12345";
const DEMO_USER_NAME = "Karan Veer";

const demoUser: User = {
  id: CURRENT_USER.id,
  email: DEMO_SELLER_EMAIL,
  name: DEMO_USER_NAME,
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
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        const valid = otp === DEMO_OTP;
        if (!valid) {
          set({ isLoading: false });
          return { ok: false, message: "Invalid OTP. Use 123456 for demo." };
        }

        const mobile = get().pendingMobile || DEMO_PHONE;

        try {
          const response = await apiClient.post("/auth/login", {
            email: DEMO_SELLER_EMAIL,
            password: DEMO_PASSWORD,
          });
          const payload = response.data?.data ?? response.data;
          const accessToken = payload.accessToken as string;
          const refreshToken = (payload.refreshToken as string) ?? "refresh";
          const backendUser = payload.user as {
            id: string;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
          };
          const user: User = {
            ...demoUser,
            id: backendUser?.id ?? demoUser.id,
            email: backendUser?.email ?? DEMO_SELLER_EMAIL,
            name:
              [backendUser?.firstName, backendUser?.lastName].filter(Boolean).join(" ") ||
              DEMO_USER_NAME,
            company: sellerProfileMock.companyName,
          };
          storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          set({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
            pendingMobile: mobile,
          });
          return { ok: true };
        } catch {
          set({ isLoading: false });
          return { ok: false, message: "Unable to sign in. Check API connection." };
        }
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
