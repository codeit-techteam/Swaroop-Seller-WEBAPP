import type { Permission } from "@/config/permissions";
import type { UserRole } from "@/config/roles";

export type AdminAccountStatus = "active" | "invited" | "suspended";

export type ProfileModalType = "edit" | null;

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  avatarUrl?: string;
  role: UserRole;
  department: string;
  employeeId: string;
  officeLocation: string;
  joinedAt: string;
  status: AdminAccountStatus;
  lastLoginAt: string;
  permissions: Permission[];
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export interface EditProfileForm {
  name: string;
  email: string;
  phone: string;
  department: string;
  officeLocation: string;
  avatarFileName?: string;
  avatarPreview?: string;
}

export const defaultEditProfileForm: EditProfileForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  officeLocation: "",
};

/** @deprecated Legacy seller profile shape — kept for type re-exports during migration */
export type KycStatus = "verified" | "pending" | "rejected";
export type ProfileDocumentStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "pending";
export type BankVerificationStatus = "verified" | "pending" | "unverified";
export type ProfileDocumentType = "gst" | "msme" | "coa" | "iso" | "other";

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

export const defaultVerificationForm: VerificationForm = {
  reason: "",
};
