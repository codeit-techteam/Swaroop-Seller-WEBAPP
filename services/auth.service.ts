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
  status?: string;
  roles?: string[];
};

export type AuthSessionPayload = AuthTokensPayload & {
  user: BackendAuthUser;
};

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
      return "Unable to reach PetroTrade API. Confirm the backend is running on port 3000.";
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
    const body = trimmed.includes("@")
      ? { email: trimmed.toLowerCase(), password }
      : { phone: toE164IndianPhone(trimmed), password };
    const response = await apiClient.post("/auth/login", body);
    return (response.data?.data ?? response.data) as AuthSessionPayload;
  },

  mapUser(
    backendUser: BackendAuthUser | undefined,
    fallback: User,
  ): User {
    return {
      ...fallback,
      id: backendUser?.id ?? fallback.id,
      email: backendUser?.email ?? fallback.email,
      name:
        [backendUser?.firstName, backendUser?.lastName].filter(Boolean).join(" ") ||
        fallback.name,
    };
  },
};
