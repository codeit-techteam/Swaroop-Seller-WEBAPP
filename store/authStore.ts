import { isAxiosError } from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ROLE_LABELS } from "@/config";
import { STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/utils";
import { clearSellerQueries } from "@/providers/query-provider";
import {
  type RotatedTokens,
  SESSION_EXPIRED_EVENT,
  TOKENS_ROTATED_EVENT,
} from "@/services/apiClient";
import { authErrorMessage, authService } from "@/services/auth.service";
import { useLocationStore } from "@/store/locationStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSellerStore } from "@/store/sellerStore";
import type { AuthState, AuthTokens, User } from "@/types/auth";

/** Placeholder until the API's user payload fills these in; never a real tenant. */
function fallbackUser(email = ""): User {
  return { id: "", email, name: "Seller", role: "SELLER" };
}

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
          set({ isLoading: false });
          // A 429 means an OTP was issued moments ago and is still valid.
          if (isAxiosError(error) && error.response?.status === 429) {
            return { ok: true };
          }
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to send OTP."),
          };
        }
      },
      verifyOtp: async (otp) => {
        set({ isLoading: true });
        const mobile = get().pendingMobile;

        if (!mobile) {
          set({ isLoading: false });
          return {
            ok: false,
            message: "Start login again to receive a new OTP.",
          };
        }
        if (otp.length !== 6) {
          set({ isLoading: false });
          return { ok: false, message: "Enter the 6-digit OTP." };
        }

        try {
          const session = await authService.verifyOtp(mobile, otp);
          const user = authService.mapUser(
            session.user,
            fallbackUser(session.user?.email ?? ""),
          );
          applySession(
            set,
            user,
            session.accessToken,
            session.refreshToken ?? "",
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
              "Unable to sign in. Please try again.",
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
      syncOnboardingFromApi: async () => {
        if (!get().isAuthenticated) return false;
        return resolveAndSetOnboarding(set, get().onboardingComplete);
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      setSession: (user, tokens = null) => {
        const previousUserId = get().user?.id;
        if (previousUserId && user.id && previousUserId !== user.id) {
          clearSellerQueries();
          useSellerStore.getState().resetSeller();
          useOnboardingStore.getState().resetOnboarding();
        }
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
        useSellerStore.getState().resetSeller();
        useOnboardingStore.getState().resetOnboarding();
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
        if (state?.tokens?.accessToken) {
          // The token keys are the source of truth; the persisted copy may
          // predate a silent refresh and hold an already-rotated refresh token.
          const liveAccess = storage.get<string | null>(
            STORAGE_KEYS.AUTH_TOKEN,
            null,
          );
          const liveRefresh = storage.get<string | null>(
            STORAGE_KEYS.REFRESH_TOKEN,
            null,
          );
          if (liveAccess && liveRefresh) {
            state.tokens = {
              accessToken: liveAccess,
              refreshToken: liveRefresh,
            };
          } else {
            syncTokenStorage(state.tokens);
          }
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener(TOKENS_ROTATED_EVENT, (event) => {
    if (!useAuthStore.getState().isAuthenticated) return;
    useAuthStore.setState({
      tokens: (event as CustomEvent<RotatedTokens>).detail,
    });
  });
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    if (useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEYS.REFRESH_TOKEN) return;
    const state = useAuthStore.getState();
    if (!state.isAuthenticated) return;
    if (!event.newValue) {
      // Signed out in another tab.
      state.logout();
      return;
    }
    const refreshToken = storage.get<string | null>(
      STORAGE_KEYS.REFRESH_TOKEN,
      null,
    );
    const accessToken = storage.get<string | null>(
      STORAGE_KEYS.AUTH_TOKEN,
      null,
    );
    if (refreshToken && accessToken) {
      useAuthStore.setState({ tokens: { accessToken, refreshToken } });
    }
  });
}

export { ROLE_LABELS };
