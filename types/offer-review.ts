export type OfferReviewStatus =
  | "pending_review"
  | "needs_changes"
  | "approved"
  | "published"
  | "rejected"
  | "withdrawn"
  | "draft";

export type OfferReviewTimelineStage =
  | "submitted"
  | "review_started"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected";

export type OfferReviewDialogType =
  "withdraw" | "duplicate" | "resubmit" | "success" | "history" | null;

export interface OfferReviewTimelineStep {
  id: string;
  stage: OfferReviewTimelineStage;
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "pending" | "warning" | "danger";
  reviewer?: string;
}

export interface RequestedChange {
  id: string;
  field: string;
  currentValue: string;
  expectedValue?: string;
  marketCeiling?: string;
  actionRequired: boolean;
}

export type OfferReviewDocumentCategory =
  | "coa"
  | "inventory_report"
  | "quality_certificate"
  | "specification_sheet"
  | "other";

export interface OfferReviewDocument {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string;
  category: OfferReviewDocumentCategory;
}

export interface OfferVersion {
  id: string;
  version: number;
  label: string;
  timestamp: string;
  isLatest?: boolean;
}

export interface AdminFeedback {
  title: string;
  message: string;
  type: "warning" | "info" | "danger";
}

export interface OfferReview {
  id: string;
  offerId: string;
  productGrade: string;
  warehouse: string;
  quantityMt: number;
  basePrice: number;
  currency: string;
  submittedAt: string;
  status: OfferReviewStatus;
  timeline: OfferReviewTimelineStep[];
  adminFeedback: AdminFeedback | null;
  requestedChanges: RequestedChange[];
  documents: OfferReviewDocument[];
  versionHistory: OfferVersion[];
  withdrawReason?: string;
}

export interface OfferReviewSummary {
  totalSubmitted: number;
  pendingReview: number;
  approved: number;
  needsChanges: number;
  rejected: number;
}

export interface OfferReviewFilters {
  search: string;
  status: OfferReviewStatus | "all";
  productGrade: string;
  warehouse: string;
  dateFrom: string;
  dateTo: string;
  minQuantity: string;
  maxQuantity: string;
}

export interface OfferReviewSort {
  key: keyof Pick<
    OfferReview,
    | "offerId"
    | "productGrade"
    | "warehouse"
    | "quantityMt"
    | "basePrice"
    | "submittedAt"
    | "status"
  >;
  direction: "asc" | "desc";
}

export const OFFER_REVIEW_STATUS_LABELS: Record<OfferReviewStatus, string> = {
  pending_review: "Pending Review",
  needs_changes: "Needs Changes",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  draft: "Draft",
};

export const OFFER_REVIEW_SUMMARY_KEYS = [
  "totalSubmitted",
  "pendingReview",
  "approved",
  "needsChanges",
  "rejected",
] as const;

export type OfferReviewSummaryKey = (typeof OFFER_REVIEW_SUMMARY_KEYS)[number];
