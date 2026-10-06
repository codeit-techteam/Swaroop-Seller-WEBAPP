import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";

import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/utils/storage";

import { axiosInstance } from "./axios";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Dispatched after a silent refresh so the auth store can adopt the rotated tokens. */
export const TOKENS_ROTATED_EVENT = "pt-seller-tokens-rotated";
/** Dispatched when the refresh token is rejected and the seller must sign in again. */
export const SESSION_EXPIRED_EVENT = "pt-seller-session-expired";

export type RotatedTokens = { accessToken: string; refreshToken: string };

const REFRESH_LOCK_NAME = "pt-seller-token-refresh";
const EXPIRY_SKEW_MS = 30_000;

function readPersistedSessionTokens(): {
  accessToken?: string;
  refreshToken?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      state?: { tokens?: { accessToken?: string; refreshToken?: string } };
    };
    return parsed?.state?.tokens ?? {};
  } catch {
    return {};
  }
}

function resolveAccessToken(): string | null {
  const fromStorage = storage.get<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  if (typeof fromStorage === "string" && fromStorage.trim()) {
    return fromStorage.trim();
  }

  // Legacy sessions may only have tokens inside the Zustand persist blob.
  const { accessToken, refreshToken } = readPersistedSessionTokens();
  if (typeof accessToken === "string" && accessToken.trim()) {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken.trim());
    if (
      typeof refreshToken === "string" &&
      refreshToken.trim() &&
      !storage.get<string | null>(STORAGE_KEYS.REFRESH_TOKEN, null)
    ) {
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken.trim());
    }
    return accessToken.trim();
  }
  return null;
}

function resolveRefreshToken(): string | null {
  const fromStorage = storage.get<string | null>(
    STORAGE_KEYS.REFRESH_TOKEN,
    null,
  );
  if (typeof fromStorage === "string" && fromStorage.trim()) {
    return fromStorage.trim();
  }

  const { refreshToken } = readPersistedSessionTokens();
  if (typeof refreshToken === "string" && refreshToken.trim()) {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken.trim());
    return refreshToken.trim();
  }
  return null;
}

function jwtExpiryMs(token: string): number | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const payload = JSON.parse(
      atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isAccessTokenExpiring(
  token: string | null,
  skewMs = EXPIRY_SKEW_MS,
): boolean {
  if (!token) return true;
  const exp = jwtExpiryMs(token);
  if (exp == null) return false;
  return Date.now() >= exp - skewMs;
}

function persistRotatedTokens(tokens: RotatedTokens) {
  storage.set(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  window.dispatchEvent(
    new CustomEvent<RotatedTokens>(TOKENS_ROTATED_EVENT, { detail: tokens }),
  );
}

function expireSession() {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

/** Serialize refreshes across tabs: the backend revokes the session family on refresh-token reuse. */
async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, fn);
  }
  return fn();
}

type RefreshOutcome =
  { token: string } | { expired: true } | { transient: true };

async function performRefresh(
  staleRefreshToken: string | null,
): Promise<RefreshOutcome> {
  const refreshToken = resolveRefreshToken();
  if (!refreshToken || refreshToken === "refresh") return { expired: true };

  // Another tab rotated while we waited for the lock.
  if (staleRefreshToken && refreshToken !== staleRefreshToken) {
    const access = resolveAccessToken();
    if (access && !isAccessTokenExpiring(access, 0)) return { token: access };
  }

  try {
    // Bare client so we never recurse through the 401 interceptor.
    const response = await axios.post<{
      data?: { accessToken?: string; refreshToken?: string };
    }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 },
    );
    const accessToken = response.data?.data?.accessToken?.trim();
    if (!accessToken) return { expired: true };
    const nextRefresh =
      response.data?.data?.refreshToken?.trim() || refreshToken;
    persistRotatedTokens({ accessToken, refreshToken: nextRefresh });
    return { token: accessToken };
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    if (status && status >= 400 && status < 500) return { expired: true };
    return { transient: true };
  }
}

let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const staleRefreshToken = resolveRefreshToken();
  refreshInFlight = withRefreshLock(() => performRefresh(staleRefreshToken))
    .then((outcome) => {
      if ("token" in outcome) return outcome.token;
      if ("expired" in outcome) expireSession();
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

function isAuthEndpoint(url: string) {
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/otp")
  );
}

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isAuthEndpoint(config.url ?? "")) return config;

    let token = resolveAccessToken();
    if (token && isAccessTokenExpiring(token) && resolveRefreshToken()) {
      token = (await refreshAccessToken()) ?? token;
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(url)
    ) {
      original._retry = true;
      const sent = String(original.headers?.Authorization ?? "");
      const latest = resolveAccessToken();
      const nextToken =
        latest && !sent.endsWith(latest) && !isAccessTokenExpiring(latest, 0)
          ? latest
          : await refreshAccessToken();
      if (nextToken) {
        original.headers.Authorization = `Bearer ${nextToken}`;
        return axiosInstance(original);
      }
    }

    return Promise.reject(error);
  },
);

export { axiosInstance as apiClient };
