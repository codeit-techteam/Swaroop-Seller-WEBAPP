import { apiClient } from "@/services/apiClient";

/** Mirrors `SellerProfileSummary` from GET /seller/profile (shared with the Seller app). */
export type SellerAccountSummary = {
  sellerProfileId: string;
  status: string;
  verificationStatus: string;
  verified: boolean;
  ownerName: string;
  companyName: string;
  legalName: string;
  initials: string;
  businessType: string | null;
  sellerType: string | null;
  industry: string | null;
  contactName: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  gstState: string | null;
  pan: string | null;
  logoUrl: string | null;
  yearsInBusiness: string | null;
  paymentTerms: string | null;
  registeredAddress: string | null;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    type: string;
  } | null;
  bank: {
    accountHolder: string;
    bankName: string;
    accountNumberMasked: string;
    ifsc: string;
    branch: string | null;
    verificationStatus: string;
  } | null;
  gstVerified: boolean;
  panVerified: boolean;
  bankVerified: boolean;
  kycDocumentsCount: number;
  approvedAt: string | null;
};

export type SellerAccountManager = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  title?: string | null;
  status?: string;
  isPrimary?: boolean;
  seller?: string;
};

export async function fetchSellerAccountProfile(): Promise<{
  summary: SellerAccountSummary;
  accountManagers: SellerAccountManager[];
}> {
  const response = await apiClient.get("/seller/profile");
  const payload = response.data?.data ?? response.data;
  if (!payload?.summary) {
    throw new Error("Seller profile response is missing the account summary.");
  }
  return {
    summary: payload.summary as SellerAccountSummary,
    accountManagers: Array.isArray(payload.accountManagers)
      ? (payload.accountManagers as SellerAccountManager[])
      : [],
  };
}
