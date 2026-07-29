export type DocumentCategory =
  "business_statutory" | "technical_quality" | "logistics" | "marketplace";

export type DocumentStatus =
  "verified" | "pending" | "expiring" | "expired" | "archived";

export type DocumentType =
  | "GST"
  | "PAN"
  | "MSME"
  | "ISO"
  | "COA"
  | "TDS"
  | "MSDS"
  | "Invoice"
  | "E-Way"
  | "POD"
  | "Loading Slip"
  | "Offer Approval"
  | "Settlement Statement";

export type SearchField =
  "document_name" | "reference" | "certificate" | "invoice" | "eway_bill";

export type ExpiryFilter = "all" | "7" | "15" | "30" | "90" | "expired";

export type PreviewMimeType =
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface DocumentVersion {
  id: string;
  version: string;
  label: string;
  timestamp: string;
  uploadedBy: string;
  isLatest: boolean;
  fileName: string;
}

export interface SellerDocument {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  reference: string;
  status: DocumentStatus;
  version: string;
  expiryDate: string | null;
  uploadDate: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  remarks: string | null;
  fileName: string;
  fileSizeLabel: string;
  previewUrl: string;
  previewMimeType: PreviewMimeType;
  daysUntilExpiry: number | null;
  archived: boolean;
  versionHistory: DocumentVersion[];
  metadata?: Record<string, string>;
}

export interface DocumentSummary {
  complianceScore: number;
  pendingVerification: number;
  expiringSoon: number;
  totalDocuments: number;
}

export interface DocumentFilters {
  search: string;
  searchField: SearchField;
  category: DocumentCategory | "all";
  status: DocumentStatus | "all";
  expiry: ExpiryFilter;
}

export interface UploadFormData {
  category: DocumentCategory | "";
  name: string;
  version: string;
  expiryDate: string;
  remarks: string;
}

export interface UploadModalState {
  open: boolean;
  mode: "new" | "replace" | "renew";
  documentId: string | null;
  form: UploadFormData;
  file: File | null;
  errors: Partial<Record<keyof UploadFormData | "file", string>>;
  isUploading: boolean;
  uploadProgress: number;
}

export interface PreviewModalState {
  open: boolean;
  documentId: string | null;
}

export interface VersionHistoryModalState {
  open: boolean;
  documentId: string | null;
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  business_statutory: "Business & Statutory Documents",
  technical_quality: "Technical & Quality Records",
  logistics: "Logistics Archive",
  marketplace: "Marketplace Records",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  expiring: "Expiring",
  expired: "Expired",
  archived: "Archived",
};

export const DOCUMENT_TYPES_BY_CATEGORY: Record<
  DocumentCategory,
  DocumentType[]
> = {
  business_statutory: ["GST", "PAN", "MSME", "ISO", "TDS"],
  technical_quality: ["COA", "MSDS"],
  logistics: ["Invoice", "E-Way", "POD", "Loading Slip"],
  marketplace: ["Offer Approval", "Settlement Statement"],
};

export const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: "document_name", label: "Document Name" },
  { value: "reference", label: "Reference" },
  { value: "certificate", label: "Certificate" },
  { value: "invoice", label: "Invoice" },
  { value: "eway_bill", label: "E-Way Bill" },
];

export const EXPIRY_FILTER_OPTIONS: { value: ExpiryFilter; label: string }[] = [
  { value: "all", label: "All Expiry Windows" },
  { value: "7", label: "Within 7 Days" },
  { value: "15", label: "Within 15 Days" },
  { value: "30", label: "Within 30 Days" },
  { value: "90", label: "Within 90 Days" },
  { value: "expired", label: "Expired" },
];

/** @deprecated Use SellerDocument */
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}
