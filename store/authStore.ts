import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { sellerProfileMock } from "@/lib/mock/locations";
import { storage } from "@/lib/utils";
import { clearSellerQueries } from "@/providers/query-provider";
import { authErrorMessage, authService } from "@/services/auth.service";
import { useLocationStore } from "@/store/locationStore";
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

type VerifyOtpResult = {
  ok: boolean;
  message?: string;
  onboardingComplete?: boolean;
};

interface SellerAuthState extends AuthState {
  onboardingComplete: boolean;
  pendingMobile: string;
  hasHydrated: boolean;
  setPendingMobile: (mobile: string) => void;
  sendOtp: (mobile: string) => Promise<{ ok: boolean; message?: string }>;
  verifyOtp: (otp: string) => Promise<VerifyOtpResult>;
  loginWithCredentials: (
    identifier: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  /** Re-auth as seeded seller@test.local (used when catalog 404s without a profile). */
  ensureDemoSellerSession: () => Promise<{ ok: boolean; message?: string }>;
  /** Refresh onboarding flag from GET /seller/status (heals stuck local sessions). */
  syncOnboardingFromApi: () => Promise<boolean>;
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

/** Keep apiClient token storage in sync with persisted Zustand session. */
function syncTokenStorage(tokens: AuthTokens | null | undefined) {
  if (tokens?.accessToken) {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  }
}

async function resolveAndSetOnboarding(
  set: (partial: Partial<SellerAuthState>) => void,
  fallbackWhenApiFails: boolean,
): Promise<boolean> {
  try {
    const complete = await authService.resolveOnboardingComplete();
    set({ onboardingComplete: complete, isLoading: false });
    return complete;
  } catch {
    set({ onboardingComplete: fallbackWhenApiFails, isLoading: false });
    return fallbackWhenApiFails;
  }
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
  );
  return resolveAndSetOnboarding(set, true);
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
          if (isDemoLogin) {
            // 1) Preferred: real OTP verify for Karan Veer phone (dev fixed OTP).
            try {
              const session = await authService.verifyOtp(mobile, otp);
              const user = authService.mapUser(session.user, {
                ...demoUser,
                email: session.user.email ?? demoUser.email,
                name:
                  [session.user.firstName, session.user.lastName]
                    .filter(Boolean)
                    .join(" ") || DEMO_USER_NAME,
                company: sellerProfileMock.companyName,
              });
              applySession(
                set,
                user,
                session.accessToken,
                session.refreshToken ?? "refresh",
                mobile,
              );
              const onboardingComplete = await resolveAndSetOnboarding(
                set,
                true,
              );
              return { ok: true, onboardingComplete };
            } catch {
              /* fall through to seeded seller email login */
            }

            // 2) Fallback: seeded seller@test.local catalog account.
            try {
              const onboardingComplete = await loginDemoSellerSession(
                set,
                mobile,
              );
              return { ok: true, onboardingComplete };
            } catch {
              /* fall through */
            }

            // 3) Last resort: phone + shared demo password.
            try {
              const session = await authService.loginWithPassword(
                mobile,
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
              );
              const onboardingComplete = await resolveAndSetOnboarding(
                set,
                true,
              );
              return { ok: true, onboardingComplete };
            } catch (error) {
              set({ isLoading: false });
              return {
                ok: false,
                message: authErrorMessage(
                  error,
                  "Demo login failed. Start Swaroop-Backend locally or seed Karan Veer on the API DB.",
                ),
              };
            }
          }

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
          const onboardingComplete = await resolveAndSetOnboarding(set, false);
          return { ok: true, onboardingComplete };
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
      loginWithCredentials: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const session = await authService.loginWithPassword(
            identifier,
            password,
          );
          const user = authService.mapUser(session.user, {
            id: session.user?.id ?? "",
            email: session.user?.email ?? identifier,
            name: "Seller",
            role: "SELLER",
          });
          applySession(
            set,
            user,
            session.accessToken,
            session.refreshToken ?? "",
            "",
            user.role === "SELLER_MANAGER"
              ? { onboardingComplete: true }
              : undefined,
          );
          if (user.role !== "SELLER_MANAGER") {
            await resolveAndSetOnboarding(set, false);
          }
          return { ok: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to sign in."),
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
            message: authErrorMessage(
              error,
              "Unable to restore seller session.",
            ),
          };
        }
      },
      syncOnboardingFromApi: async () => {
        if (!get().isAuthenticated) return false;
        return resolveAndSetOnboarding(set, get().onboardingComplete);
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      setSession: (user, tokens = null) => {
        syncTokenStorage(tokens);
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        clearSellerQueries();
        useLocationStore.getState().reset();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          pendingMobile: "",
          onboardingComplete: false,
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
        // Zustand may restore the user while apiClient's token key is empty
        // (e.g. after a prior 401 cleared petrotrade_auth_token).
        if (state?.tokens?.accessToken) {
          syncTokenStorage(state.tokens);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export { ROLE_LABELS };
