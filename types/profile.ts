export type KycStatus = "verified" | "pending" | "rejected";

export type ProfileDocumentStatus =
  "active" | "expiring_soon" | "expired" | "pending";

export type BankVerificationStatus = "verified" | "pending" | "unverified";

export type ProfileDocumentType = "gst" | "msme" | "coa" | "iso" | "other";

export type ProfileModalType =
  | "edit"
  | "preview"
  | "verification"
  | "document_upload"
  | "document_preview"
  | null;

export interface ProfileDocument {
  id: string;
  type: ProfileDocumentType;
  title: string;
  fileName: string;
  status: ProfileDocumentStatus;
  expiryDate: string;
  daysUntilExpiry?: number;
  previewUrl?: string;
}

export interface BusinessIdentity {
  gstin: string;
  pan: string;
  cin: string;
}

export interface BankInformation {
  beneficiaryName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  branch: string;
  verificationStatus: BankVerificationStatus;
}

export interface WarehouseLocation {
  id: string;
  label: string;
  isPrimary: boolean;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface SellerProfile {
  id: string;
  companyName: string;
  logoUrl?: string;
  logoInitials: string;
  kycStatus: KycStatus;
  sellerRating: number;
  maxRating: number;
  headquarters: string;
  partnerSince: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  businessType: string;
  yearsInBusiness: number;
  primaryCategories: string[];
  warehouses: WarehouseLocation[];
  logisticsPartners: LogisticsPartner[];
  businessIdentity: BusinessIdentity;
  bankInformation: BankInformation;
  documents: ProfileDocument[];
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export interface EditProfileForm {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  warehouse: string;
  businessCategory: string;
  logoFileName?: string;
  logoPreview?: string;
}

export interface VerificationForm {
  reason: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  gstNumber: string;
}

export const defaultEditProfileForm: EditProfileForm = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  description: "",
  warehouse: "",
  businessCategory: "",
};

export const defaultVerificationForm: VerificationForm = {
  reason: "",
};
