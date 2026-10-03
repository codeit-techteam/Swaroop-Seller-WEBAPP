import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import type { User } from "@/types/auth";

export type AuthTokensPayload = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export type BackendAuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  status?: string;
  roles?: string[];
  loginId?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  permissions?: string[];
  mustChangePassword?: boolean;
};

export type AuthSessionPayload = AuthTokensPayload & {
  user: BackendAuthUser;
};

export type SellerStatusPayload = {
  sellerProfileId: string;
  status: string;
  onboarding?: {
    status?: string | null;
    currentStep?: string | null;
    completedSteps?: string[] | null;
  } | null;
};

/** Seller has a real profile past draft → skip onboarding wizard. */
export function isSellerOnboardingComplete(
  status: SellerStatusPayload | null | undefined,
): boolean {
  if (!status?.sellerProfileId) return false;
  if (status.status && status.status !== "DRAFT") return true;
  const onboardingStatus = status.onboarding?.status;
  return Boolean(onboardingStatus && onboardingStatus !== "DRAFT");
}

export function toE164IndianPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (mobile.trim().startsWith("+")) return mobile.trim();
  return `+91${digits}`;
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[]; code?: string }>(error)) {
    const payload = error.response?.data;
    const message = payload?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return message[0];
    if (!error.response) {
      return "Unable to reach PetroTrade. Check your internet connection and try again.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export const authService = {
  async sendOtp(mobile: string) {
    const phone = toE164IndianPhone(mobile);
    const response = await apiClient.post("/auth/otp/send", {
      phone,
      purpose: "LOGIN",
    });
    const data = response.data?.data ?? response.data;
    return {
      sent: true as const,
      mobile,
      phone,
      demoOtp: (data?.devOtp as string | undefined) ?? "123456",
    };
  },

  async verifyOtp(mobile: string, otp: string): Promise<AuthSessionPayload> {
    const phone = toE164IndianPhone(mobile);
    const response = await apiClient.post("/auth/otp/verify", {
      phone,
      otp,
      purpose: "LOGIN",
      roleHint: "SELLER",
    });
    return (response.data?.data ?? response.data) as AuthSessionPayload;
  },

  async loginWithPassword(
    identifier: string,
    password: string,
  ): Promise<AuthSessionPayload> {
    const trimmed = identifier.trim();
    const digits = trimmed.replace(/\D/g, "");
    const body = trimmed.includes("@")
      ? { email: trimmed.toLowerCase(), password }
      : digits.length >= 10
        ? { phone: toE164IndianPhone(trimmed), password }
        : { identifier: trimmed, password };
    const response = await apiClient.post("/auth/login", body);
    return (response.data?.data ?? response.data) as AuthSessionPayload;
  },

  mapUser(backendUser: BackendAuthUser | undefined, fallback: User): User {
    const roles = backendUser?.roles ?? [];
    const role = roles.includes("SELLER_MANAGER")
      ? "SELLER_MANAGER"
      : roles.includes("SELLER")
        ? "SELLER"
        : fallback.role;
    return {
      ...fallback,
      id: backendUser?.id ?? fallback.id,
      email: backendUser?.email ?? fallback.email,
      name:
        backendUser?.displayName ||
        [backendUser?.firstName, backendUser?.lastName]
          .filter(Boolean)
          .join(" ") ||
        fallback.name,
      role,
      loginId: backendUser?.loginId ?? fallback.loginId,
      sellerId: backendUser?.sellerId ?? fallback.sellerId,
      sellerName: backendUser?.sellerName ?? fallback.company,
      company: backendUser?.sellerName ?? fallback.company,
      permissions: backendUser?.permissions ?? fallback.permissions,
      mustChangePassword: Boolean(backendUser?.mustChangePassword),
    };
  },

  async fetchSellerStatus(): Promise<SellerStatusPayload | null> {
    try {
      const response = await apiClient.get("/seller/status");
      return (response.data?.data ?? response.data) as SellerStatusPayload;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /** After login: true when seller profile already exists past draft. */
  async resolveOnboardingComplete(): Promise<boolean> {
    try {
      const status = await this.fetchSellerStatus();
      return isSellerOnboardingComplete(status);
    } catch {
      return false;
    }
  },
};
