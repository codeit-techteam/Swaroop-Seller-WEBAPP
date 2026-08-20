export type CustomerType = "INDIVIDUAL" | "CONTRACTOR" | "DESIGNER" | "BUILDER";

export type CustomerKycStatus =
  "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export type CustomerCreditStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

export type CustomerAccountStatus =
  "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export type CustomerSegmentKind = "STATIC" | "DYNAMIC";

export interface CustomerAddress {
  id: string;
  label: string;
  kind: "BILLING" | "BUSINESS" | "DELIVERY" | "WAREHOUSE";
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CustomerDocument {
  id: string;
  type:
    "GST" | "PAN" | "KYC" | "INVOICE" | "PO" | "ORDER" | "DELIVERY" | "OTHER";
  name: string;
  status: CustomerKycStatus;
  uploadedAt: string;
  sizeLabel: string;
}

export interface CustomerCredit {
  limit: number;
  available: number;
  used: number;
  outstanding: number;
  status: CustomerCreditStatus;
  insuranceStatus: "ACTIVE" | "UNDER_REVIEW" | "EXPIRED" | "NONE";
  expiry: string;
  utilizationPct: number;
}

export interface CustomerActivityEvent {
  id: string;
  at: string;
  title: string;
  description: string;
  kind:
    "LOGIN" | "ORDER" | "PR" | "PAYMENT" | "KYC" | "SUPPORT" | "NOTIFICATION";
}

export interface CustomerProfile {
  id: string;
  customerId: string;
  name: string;
  companyName: string;
  customerType: CustomerType;
  mobile: string;
  email: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  contactPerson: string;
  kycStatus: CustomerKycStatus;
  creditStatus: CustomerCreditStatus;
  accountStatus: CustomerAccountStatus;
  availableCredit: number;
  creditLimit: number;
  usedCredit: number;
  outstanding: number;
  totalOrders: number;
  totalPurchaseValue: number;
  activeOrders: number;
  pendingPayments: number;
  lastActive: string;
  lastLogin: string;
  lastOrder: string;
  createdAt: string;
  rejectionReason?: string;
  addresses: CustomerAddress[];
  documents: CustomerDocument[];
  credit: CustomerCredit;
  activity: CustomerActivityEvent[];
}

export interface CustomerDraft {
  name: string;
  companyName: string;
  customerType: CustomerType;
  mobile: string;
  email: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  contactPerson: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  kind: CustomerSegmentKind;
  description: string;
  customerType?: CustomerType;
  rule: string;
  customerCount: number;
  usedFor: Array<
    "OFFERS" | "BANNERS" | "NOTIFICATIONS" | "PRICING" | "PROMOTIONS"
  >;
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  INDIVIDUAL: "Individual",
  CONTRACTOR: "Contractor / Mason",
  DESIGNER: "Interior Designer / Architect",
  BUILDER: "Builder / Developer",
};

export const defaultCustomerDraft = (): CustomerDraft => ({
  name: "",
  companyName: "",
  customerType: "INDIVIDUAL",
  mobile: "",
  email: "",
  gstin: "",
  pan: "",
  city: "",
  state: "",
  contactPerson: "",
});
