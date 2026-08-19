import type { UserRole } from "@/config/roles";

export type DirectoryUserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";
export type KycBadge = "VERIFIED" | "PENDING" | "EXPIRED" | "REJECTED";
export type SupplierStatus = "ACTIVE" | "ONBOARDING" | "HOLD" | "INACTIVE";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  status: DirectoryUserStatus;
  kyc: KycBadge;
  lastActive: string;
}

export interface Supplier {
  id: string;
  name: string;
  gstin: string;
  location: string;
  commodities: string;
  status: SupplierStatus;
  kyc: KycBadge;
  creditLimit: number;
  lastActive: string;
  legalName?: string;
  sellerType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  pan?: string;
  cin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTerms?: string;
  creditAvailable?: boolean;
  moq?: string;
  gstStatus?: string;
  documentsStatus?: string;
}
