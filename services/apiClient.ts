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

function resolveAccessToken(): string | null {
  const fromStorage = storage.get<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  if (typeof fromStorage === "string" && fromStorage.trim()) {
    return fromStorage.trim();
  }

  // Fallback: Zustand persisted session (AUTH_SESSION) may still hold tokens
  // after petrotrade_auth_token was cleared by a prior 401.
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { tokens?: { accessToken?: string; refreshToken?: string } };
    };
    const token = parsed?.state?.tokens?.accessToken;
    if (typeof token === "string" && token.trim()) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token.trim());
      const refresh = parsed?.state?.tokens?.refreshToken;
      if (typeof refresh === "string" && refresh.trim()) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refresh.trim());
      }
      return token.trim();
    }
  } catch {
    // ignore parse errors
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

  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { tokens?: { refreshToken?: string } };
    };
    const token = parsed?.state?.tokens?.refreshToken;
    if (typeof token === "string" && token.trim()) {
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, token.trim());
      return token.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function persistRotatedTokens(accessToken: string, refreshToken?: string) {
  storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
  if (refreshToken) {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  // Keep Zustand persist in sync so rehydration after reload still works.
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: {
        tokens?: { accessToken?: string; refreshToken?: string };
        [key: string]: unknown;
      };
      version?: number;
    };
    if (!parsed.state) return;
    parsed.state.tokens = {
      accessToken,
      refreshToken:
        refreshToken ?? parsed.state.tokens?.refreshToken ?? accessToken,
    };
    window.localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify(parsed),
    );
  } catch {
    // ignore
  }
}

function clearAuthTokens() {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
}

/** Single-flight refresh so concurrent 401s share one rotation. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = resolveRefreshToken();
    if (!refreshToken || refreshToken === "refresh") {
      return null;
    }

    try {
      // Use a bare client so we never recurse through the 401 interceptor.
      const response = await axios.post<{
        data?: { accessToken?: string; refreshToken?: string };
        accessToken?: string;
        refreshToken?: string;
      }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      const payload = response.data?.data ?? response.data;
      const accessToken = payload?.accessToken;
      if (typeof accessToken !== "string" || !accessToken.trim()) {
        return null;
      }
      const nextRefresh =
        typeof payload?.refreshToken === "string" && payload.refreshToken.trim()
          ? payload.refreshToken.trim()
          : refreshToken;
      persistRotatedTokens(accessToken.trim(), nextRefresh);
      return accessToken.trim();
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = resolveAccessToken();

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

    // Never try to refresh the refresh/login endpoints themselves.
    const isAuthEndpoint =
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/otp");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${nextToken}`;
        return axiosInstance(original);
      }
      clearAuthTokens();
    }

    return Promise.reject(error);
  },
);

export { axiosInstance as apiClient };
