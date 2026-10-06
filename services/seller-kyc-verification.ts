import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import type { VerificationStatus } from "@/types/onboarding";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
};

export type KycVerificationApiStatus =
  "VERIFYING" | "VERIFIED" | "FAILED" | "MANUAL_REVIEW";

export type KycVerificationDetails = {
  legalName?: string | null;
  tradeName?: string | null;
  gstStatus?: string | null;
  registrationDate?: string | null;
  cancellationDate?: string | null;
  taxpayerType?: string | null;
  constitution?: string | null;
  address?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  panMasked?: string | null;
  nameOnPan?: string | null;
  /** Date of birth / incorporation (YYYY-MM-DD) confirmed by PAN Verify. */
  dateOnPan?: string | null;
  panStatus?: string | null;
  panCategory?: string | null;
};

export type KycVerificationResult = {
  id: string;
  type: "PAN" | "GST";
  status: KycVerificationApiStatus;
  identifierMasked: string;
  details: KycVerificationDetails;
  failureCode: string | null;
  message: string;
  verifiedAt: string | null;
  createdAt: string;
  mismatch?: boolean;
  warning?: string | null;
};

export type SellerIdentityStatus = {
  status: string;
  locked: boolean;
  verifications: {
    pan: KycVerificationResult | null;
    gst: KycVerificationResult | null;
    mismatch: boolean;
  };
  verificationBlockers: string[];
};

export type SellerOnboardingIdentity = {
  gstin: string | null;
  pan: string | null;
  gstStatus: string | null;
  panStatus: string | null;
};

const VERIFY_TIMEOUT_MS = 30_000;

/** Maps a server verification status onto the onboarding store status. */
export function toStoreStatus(
  status: KycVerificationApiStatus | undefined | null,
): VerificationStatus {
  if (status === "VERIFIED") return "verified";
  if (status === "MANUAL_REVIEW") return "pending";
  if (status === "FAILED") return "rejected";
  return "idle";
}

/** VERIFIED or MANUAL_REVIEW lets onboarding continue; admin review is final. */
export function isVerificationAccepted(status: VerificationStatus): boolean {
  return status === "verified" || status === "pending";
}

export function verificationApiError(error: unknown, fallback: string): string {
  if (isAxiosError<Envelope<unknown>>(error)) {
    if (error.code === "ECONNABORTED") {
      return "Verification is taking longer than usual. Please try again.";
    }
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (error.response?.status === 429) {
      return "Too many verification attempts. Please try again later.";
    }
    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }
  return fallback;
}

export async function verifySellerGst(
  gstin: string,
): Promise<KycVerificationResult> {
  const response = await apiClient.post<Envelope<KycVerificationResult>>(
    "/seller/onboarding/gst/verify",
    { gstin, source: "SELLER_WEB" },
    { timeout: VERIFY_TIMEOUT_MS },
  );
  return response.data.data;
}

/** Name and date of birth / incorporation exactly as printed on the PAN card. */
export type PanHolderDetails = { fullName: string; dob: string };

export async function verifySellerPan(
  pan: string,
  holder: PanHolderDetails,
): Promise<KycVerificationResult> {
  const response = await apiClient.post<Envelope<KycVerificationResult>>(
    "/seller/onboarding/pan/verify",
    { pan, fullName: holder.fullName, dob: holder.dob, source: "SELLER_WEB" },
    { timeout: VERIFY_TIMEOUT_MS },
  );
  return response.data.data;
}

/** Formats a provider YYYY-MM-DD date as "01 Jan 2000"; other values pass through. */
export function formatKycDate(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value ?? null;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Saved identifiers and their server-derived status from the onboarding draft. */
export async function fetchSellerOnboardingIdentity(): Promise<SellerOnboardingIdentity | null> {
  try {
    const response = await apiClient.get<
      Envelope<{
        gstData?: Record<string, unknown> | null;
        panData?: Record<string, unknown> | null;
      }>
    >("/seller/onboarding", { timeout: 10_000 });
    const gstData = response.data.data?.gstData ?? {};
    const panData = response.data.data?.panData ?? {};
    return {
      gstin: readString(gstData.gstin),
      pan: readString(panData.pan),
      gstStatus: readString(gstData.status),
      panStatus: readString(panData.status),
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function fetchSellerIdentityStatus(): Promise<SellerIdentityStatus | null> {
  try {
    const response = await apiClient.get<Envelope<SellerIdentityStatus>>(
      "/seller/onboarding/status",
      { timeout: 10_000 },
    );
    return response.data.data;
  } catch (error) {
    if (
      isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 403)
    ) {
      return null;
    }
    throw error;
  }
}
