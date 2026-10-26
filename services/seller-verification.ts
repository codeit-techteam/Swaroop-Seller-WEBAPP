import { apiClient } from "@/services/apiClient";
import type {
  KycVerificationResult,
  SellerIdentityStatus,
} from "@/services/seller-kyc-verification";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
};

export type SellerChangeRequest = {
  reason: string;
  documentIds: string[];
  slots: string[];
  requestedAt: string;
};

export type SellerVerificationStatus = {
  /** SellerOnboardingStatus: DRAFT | IN_PROGRESS | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED */
  status: string;
  sellerStatus: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectedReason: string | null;
  changeRequest: SellerChangeRequest | null;
  canResubmit: boolean;
  locked: boolean;
  verifications: {
    pan: KycVerificationResult | null;
    gst: KycVerificationResult | null;
    mismatch: boolean;
  };
  verificationBlockers: string[];
};

export type SellerVerificationDetails = {
  legalName: string;
  gstin: string;
  pan: string;
  /** Server-owned: verified | manual_review | null after admin identity reset. */
  gstStatus: string | null;
  panStatus: string | null;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
};

type OnboardingPayload = {
  companyData?: Record<string, unknown> | null;
  gstData?: Record<string, unknown> | null;
  panData?: Record<string, unknown> | null;
  bankData?: Record<string, unknown> | null;
};

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function fetchSellerVerificationStatus(): Promise<SellerVerificationStatus> {
  const response = await apiClient.get<Envelope<SellerIdentityStatus>>(
    "/seller/onboarding/status",
  );
  const data = response.data.data;
  return {
    status: data.status,
    sellerStatus: data.sellerStatus ?? null,
    submittedAt: data.submittedAt ?? null,
    reviewedAt: data.reviewedAt ?? null,
    rejectedReason: data.rejectedReason ?? null,
    changeRequest: data.changeRequest ?? null,
    canResubmit: Boolean(data.canResubmit),
    locked: Boolean(data.locked),
    verifications: data.verifications ?? {
      pan: null,
      gst: null,
      mismatch: false,
    },
    verificationBlockers: data.verificationBlockers ?? [],
  };
}

async function fetchOnboardingPayload(): Promise<OnboardingPayload> {
  const response =
    await apiClient.get<Envelope<OnboardingPayload>>("/seller/onboarding");
  return response.data.data ?? {};
}

export async function fetchSellerVerificationDetails(): Promise<SellerVerificationDetails> {
  const data = await fetchOnboardingPayload();
  const company = data.companyData ?? {};
  const bank = data.bankData ?? {};
  const gstStatus = text(data.gstData?.status) || null;
  const panStatus = text(data.panData?.status) || null;
  return {
    legalName: text(company.legalName) || text(company.name),
    gstin: text(data.gstData?.gstin),
    pan: text(data.panData?.pan),
    gstStatus:
      gstStatus === "verified" || gstStatus === "manual_review"
        ? gstStatus
        : null,
    panStatus:
      panStatus === "verified" || panStatus === "manual_review"
        ? panStatus
        : null,
    accountHolder: text(bank.accountHolder),
    bankName: text(bank.bankName),
    accountNumber: text(bank.accountNumber),
    ifsc: text(bank.ifsc),
  };
}

/**
 * PATCH company name and bank only. GSTIN / PAN are owned by the Surepass
 * verify endpoints — sending unverified identifiers here is rejected or
 * stripped by the backend.
 */
export async function updateSellerVerificationDetails(
  next: SellerVerificationDetails,
): Promise<void> {
  const current = await fetchOnboardingPayload();
  const company = current.companyData ?? {};
  const bank = current.bankData ?? {};
  const patch: Record<string, Record<string, unknown>> = {};

  if (next.legalName !== (text(company.legalName) || text(company.name))) {
    patch.companyData = { ...company, legalName: next.legalName };
  }
  if (
    next.accountHolder !== text(bank.accountHolder) ||
    next.bankName !== text(bank.bankName) ||
    next.accountNumber !== text(bank.accountNumber) ||
    next.ifsc !== text(bank.ifsc)
  ) {
    patch.bankData = {
      ...bank,
      accountHolder: next.accountHolder,
      bankName: next.bankName,
      accountNumber: next.accountNumber,
      ifsc: next.ifsc,
    };
  }
  if (!Object.keys(patch).length) return;
  await apiClient.patch("/seller/onboarding", patch);
}

export async function resubmitSellerVerification(): Promise<void> {
  await apiClient.post("/seller/onboarding/submit");
}
