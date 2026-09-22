import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { sellerProfileMock } from "@/lib/mock/locations";
import { storage } from "@/lib/utils";
import { authErrorMessage, authService } from "@/services/auth.service";
import type { AuthState, AuthTokens, User } from "@/types/auth";

/** Shared demo phone UI; catalog belongs to seller@test.local (seeded profile). */
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
  sendOtp: (mobile: string) => Promise<{ ok: boolean; message?: string }>;
  verifyOtp: (otp: string) => Promise<{ ok: boolean; message?: string }>;
  /** Re-auth as seeded seller@test.local (used when catalog 404s without a profile). */
  ensureDemoSellerSession: () => Promise<{ ok: boolean; message?: string }>;
  completeOnboarding: () => void;
  setSession: (user: User, tokens?: AuthTokens | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

function applySession(
  set: (partial: Partial<SellerAuthState>) => void,
  user: User,
  accessToken: string,
  refreshToken: string,
  mobile: string,
  options?: { onboardingComplete?: boolean },
) {
  storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  set({
    user,
    tokens: { accessToken, refreshToken },
    isAuthenticated: true,
    isLoading: false,
    pendingMobile: mobile,
    ...(options?.onboardingComplete != null
      ? { onboardingComplete: options.onboardingComplete }
      : {}),
  });
}

async function loginDemoSellerSession(
  set: (partial: Partial<SellerAuthState>) => void,
  mobile: string,
) {
  // Seller catalog/products are seeded under seller@test.local, not the
  // shared customer phone account (8240890242).
  const session = await authService.loginWithPassword(
    DEMO_SELLER_EMAIL,
    DEMO_PASSWORD,
  );
  const user = authService.mapUser(session.user, {
    ...demoUser,
    company: sellerProfileMock.companyName,
  });
  applySession(
    set,
    user,
    session.accessToken,
    session.refreshToken ?? "refresh",
    mobile,
    { onboardingComplete: true },
  );
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
      sendOtp: async (mobile) => {
        set({ isLoading: true, pendingMobile: mobile });
        try {
          await authService.sendOtp(mobile);
          set({ isLoading: false });
          return { ok: true };
        } catch (error) {
          // Still open OTP screen in dev; demo OTP 123456 + password fallback works.
          set({ isLoading: false });
          return {
            ok: true,
            message: authErrorMessage(
              error,
              "OTP request failed — use demo OTP 123456.",
            ),
          };
        }
      },
      verifyOtp: async (otp) => {
        set({ isLoading: true });
        const mobile = get().pendingMobile || DEMO_PHONE;
        const digits = mobile.replace(/\D/g, "").slice(-10);
        const isDemoLogin = otp === DEMO_OTP && digits === DEMO_PHONE;

        if (otp.length !== 6) {
          set({ isLoading: false });
          return { ok: false, message: "Enter the 6-digit OTP." };
        }

        try {
          // Demo phone + OTP → seeded seller account (has products/catalog).
          if (isDemoLogin) {
            await loginDemoSellerSession(set, mobile);
            return { ok: true };
          }

          try {
            const session = await authService.verifyOtp(mobile, otp);
            const user = authService.mapUser(session.user, {
              ...demoUser,
              company: sellerProfileMock.companyName,
            });
            applySession(
              set,
              user,
              session.accessToken,
              session.refreshToken ?? "refresh",
              mobile,
            );
            return { ok: true };
          } catch (otpError) {
            if (otp === DEMO_OTP) {
              await loginDemoSellerSession(set, mobile);
              return { ok: true };
            }
            throw otpError;
          }
        } catch (error) {
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(
              error,
              "Unable to sign in. Check API connection.",
            ),
          };
        }
      },
      ensureDemoSellerSession: async () => {
        set({ isLoading: true });
        try {
          await loginDemoSellerSession(set, get().pendingMobile || DEMO_PHONE);
          return { ok: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to restore seller session."),
          };
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
