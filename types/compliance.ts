export type ComplianceDocumentStatus =
  | "verified"
  | "pending_review"
  | "expiring_soon"
  | "expired"
  | "rejected"
  | "uploaded";

export type ComplianceDocumentType =
  | "GST Certificate"
  | "Factory License"
  | "MSME Certificate"
  | "ISO 9001:2015"
  | "Pollution Control Certificate"
  | "Trade License"
  | "Import Export Code (IEC)"
  | "Company Registration"
  | "PAN"
  | "COA Approval"
  | "Warehouse License";

export type ComplianceRemarkType =
  | "renewal_required"
  | "missing_document"
  | "rejected_reason"
  | "compliance_notice"
  | "none";

export type TimelineStepStatus =
  "completed" | "current" | "pending" | "warning" | "danger";

export type TimelineStepType =
  | "uploaded"
  | "verification_started"
  | "under_review"
  | "approved"
  | "renewal_required"
  | "rejected";

export type PreviewMimeType =
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ExpiryWindow = "7" | "15" | "30" | "90" | "all";

export type FastTrackReason =
  | "trading_deadline"
  | "tier_renewal"
  | "audit_requirement"
  | "buyer_onboarding"
  | "other";

export interface ComplianceTimelineStep {
  id: string;
  type: TimelineStepType;
  title: string;
  description?: string;
  timestamp?: string;
  status: TimelineStepStatus;
}

export interface ComplianceAdminRemark {
  type: ComplianceRemarkType;
  title: string;
  message: string;
}

export interface ComplianceDocument {
  id: string;
  documentId: string;
  name: ComplianceDocumentType;
  documentNumber: string;
  status: ComplianceDocumentStatus;
  issueDate: string | null;
  expiryDate: string | null;
  verifiedBy: string | null;
  uploadedBy: string;
  uploadedAt: string;
  lastUpdated: string;
  previewUrl: string;
  previewMimeType: PreviewMimeType;
  fileName: string;
  fileSizeLabel: string;
  timeline: ComplianceTimelineStep[];
  adminRemark: ComplianceAdminRemark | null;
  daysUntilExpiry: number | null;
  version: number;
}

export interface ComplianceSummary {
  verified: number;
  expiringSoon: number;
  expired: number;
  pendingVerification: number;
}

export interface ComplianceFilters {
  search: string;
  status: ComplianceDocumentStatus | "all";
  documentType: ComplianceDocumentType | "all";
  expiryWindow: ExpiryWindow;
}

export type ComplianceSortKey =
  "name" | "status" | "expiryDate" | "verifiedBy" | "lastUpdated";

export interface ComplianceSort {
  key: ComplianceSortKey;
  direction: "asc" | "desc";
}

export type ComplianceDialogType =
  "upload" | "fast_track" | "download_preview" | null;

export const COMPLIANCE_STATUS_LABELS: Record<
  ComplianceDocumentStatus,
  string
> = {
  verified: "Verified",
  pending_review: "Pending Review",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  rejected: "Rejected",
  uploaded: "Uploaded",
};

export const COMPLIANCE_DOCUMENT_TYPES: ComplianceDocumentType[] = [
  "GST Certificate",
  "Factory License",
  "MSME Certificate",
  "ISO 9001:2015",
  "Pollution Control Certificate",
  "Trade License",
  "Import Export Code (IEC)",
  "Company Registration",
  "PAN",
  "COA Approval",
  "Warehouse License",
];

export const FAST_TRACK_REASONS: { value: FastTrackReason; label: string }[] = [
  { value: "trading_deadline", label: "Upcoming Trading Deadline" },
  { value: "tier_renewal", label: "Tier Status Renewal" },
  { value: "audit_requirement", label: "Audit / Compliance Requirement" },
  { value: "buyer_onboarding", label: "Buyer Onboarding Blocker" },
  { value: "other", label: "Other" },
];

export const EXPIRY_WINDOW_OPTIONS: { value: ExpiryWindow; label: string }[] = [
  { value: "all", label: "All Expiry Windows" },
  { value: "7", label: "Within 7 Days" },
  { value: "15", label: "Within 15 Days" },
  { value: "30", label: "Within 30 Days" },
  { value: "90", label: "Within 90 Days" },
];
