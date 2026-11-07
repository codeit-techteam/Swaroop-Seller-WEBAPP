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
      return "Unable to reach PolyStoreX. Check your internet connection and try again.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isOtpRateLimited(error: unknown): boolean {
  return (
    isAxiosError<{ code?: string }>(error) &&
    error.response?.data?.code === "AUTH_OTP_RATE_LIMITED"
  );
}

export function otpRetryAfterSeconds(error: unknown): number | undefined {
  if (
    !isAxiosError<{
      details?: { retryAfterSeconds?: number };
    }>(error)
  ) {
    return undefined;
  }
  const retry = error.response?.data?.details?.retryAfterSeconds;
  return typeof retry === "number" && retry > 0 ? Math.ceil(retry) : undefined;
}

export type SellerOtpSendResult = {
  sent: true;
  mobile: string;
  phone: string;
  smsDispatched?: boolean;
  correlationId?: string;
  devOtp?: string;
  resendCooldownSeconds?: number;
  expiresInSeconds?: number;
};

export type SellerOtpPurpose = "LOGIN" | "SIGNUP";

export type SellerSignupProfile = {
  fullName?: string;
  companyName?: string;
  gstNumber?: string;
};

export const authService = {
  async sendOtp(
    mobile: string,
    purpose: SellerOtpPurpose = "LOGIN",
  ): Promise<SellerOtpSendResult> {
    const phone = toE164IndianPhone(mobile);
    const response = await apiClient.post("/auth/otp/send", {
      phone,
      purpose,
    });
    const data = response.data?.data ?? response.data;
    if (
      data?.smsDispatched === false &&
      process.env.NODE_ENV === "production"
    ) {
      throw new Error(
        "SMS could not be dispatched. Please try again in a moment.",
      );
    }
    return {
      sent: true as const,
      mobile,
      phone,
      smsDispatched:
        typeof data?.smsDispatched === "boolean"
          ? data.smsDispatched
          : undefined,
      correlationId:
        typeof data?.correlationId === "string"
          ? data.correlationId
          : undefined,
      devOtp: data?.devOtp as string | undefined,
      resendCooldownSeconds:
        typeof data?.resendCooldownSeconds === "number"
          ? data.resendCooldownSeconds
          : undefined,
      expiresInSeconds:
        typeof data?.expiresInSeconds === "number"
          ? data.expiresInSeconds
          : undefined,
    };
  },

  async resendOtp(
    mobile: string,
    purpose: SellerOtpPurpose = "LOGIN",
  ): Promise<SellerOtpSendResult> {
    const phone = toE164IndianPhone(mobile);
    const response = await apiClient.post("/auth/otp/resend", {
      phone,
      purpose,
    });
    const data = response.data?.data ?? response.data;
    if (
      data?.smsDispatched === false &&
      process.env.NODE_ENV === "production"
    ) {
      throw new Error(
        "SMS could not be dispatched. Please try again in a moment.",
      );
    }
    return {
      sent: true as const,
      mobile,
      phone,
      smsDispatched:
        typeof data?.smsDispatched === "boolean"
          ? data.smsDispatched
          : undefined,
      correlationId:
        typeof data?.correlationId === "string"
          ? data.correlationId
          : undefined,
      resendCooldownSeconds:
        typeof data?.resendCooldownSeconds === "number"
          ? data.resendCooldownSeconds
          : undefined,
      expiresInSeconds:
        typeof data?.expiresInSeconds === "number"
          ? data.expiresInSeconds
          : undefined,
    };
  },

  async verifyOtp(
    mobile: string,
    otp: string,
    purpose: SellerOtpPurpose = "LOGIN",
    signup?: SellerSignupProfile,
  ): Promise<AuthSessionPayload> {
    const phone = toE164IndianPhone(mobile);
    const response = await apiClient.post("/auth/otp/verify", {
      phone,
      otp,
      purpose,
      roleHint: "SELLER",
      ...(signup?.fullName ? { firstName: signup.fullName.trim() } : {}),
      ...(signup?.companyName
        ? { companyName: signup.companyName.trim() }
        : {}),
      ...(signup?.gstNumber
        ? { gstin: signup.gstNumber.trim().toUpperCase() }
        : {}),
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
