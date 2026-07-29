export type PriceRevisionStatus =
  | "pending_response"
  | "countered"
  | "accepted"
  | "rejected"
  | "expired"
  | "completed";

export type ProductGrade =
  "HDPE" | "LLDPE" | "PP Raffia" | "PVC" | "ABS" | "PET";

export type RevisionReason =
  | "Market Price Decreased"
  | "Market Price Increased"
  | "Supply Surplus"
  | "Import Price Changes"
  | "Global Crude Movement"
  | "Regional Benchmark Shift";

export type TimelineStage =
  | "request_created"
  | "viewed_by_seller"
  | "counter_submitted"
  | "admin_reviewed"
  | "accepted"
  | "rejected";

export type TimelineStepStatus = "completed" | "current" | "pending" | "danger";

export type CounterValidity = "3 Days" | "7 Days" | "15 Days" | "30 Days";

export type PriceRevisionDialogType =
  | "accept"
  | "counter"
  | "reject"
  | "save_draft"
  | "history"
  | "details"
  | "view_status"
  | null;

export type PriceRevisionSortKey =
  | "requestId"
  | "productGrade"
  | "currentPrice"
  | "suggestedPrice"
  | "deadline"
  | "status";

export interface MarketRecommendation {
  priceMin: number;
  priceMax: number;
  explanation: string;
  factors: string[];
}

export interface CounterOfferDraft {
  counterPrice: string;
  moq: string;
  validity: CounterValidity | "";
  remarks: string;
}

export interface SubmittedCounterOffer {
  counterPrice: number;
  moq: number;
  validity: CounterValidity;
  remarks: string;
  submittedAt: string;
}

export interface TimelineStep {
  id: string;
  stage: TimelineStage;
  title: string;
  description?: string;
  actor?: string;
  timestamp?: string;
  status: TimelineStepStatus;
}

export interface PriceRevisionRequest {
  id: string;
  requestId: string;
  productName: string;
  productGrade: ProductGrade;
  batchNumber: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: RevisionReason;
  deadline: string;
  status: PriceRevisionStatus;
  warehouse: string;
  warehouseLabel: string;
  inventoryMt: number;
  moq: number;
  offerValidity: string;
  marketRecommendation: MarketRecommendation;
  timeline: TimelineStep[];
  counterOffer?: SubmittedCounterOffer;
  draftCounterOffer?: CounterOfferDraft;
  rejectReason?: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  acceptedAt?: string;
}

export interface PriceRevisionFilters {
  search: string;
  status: string;
  productGrade: string;
  warehouse: string;
  dateFrom: string;
  dateTo: string;
}

export interface PriceRevisionSummary {
  activeRequests: number;
  acceptedMtd: number;
  pendingResponse: number;
  counterOffers: number;
  expired: number;
}

export interface PriceRevisionSort {
  key: PriceRevisionSortKey;
  direction: "asc" | "desc";
}

export const defaultCounterOfferDraft: CounterOfferDraft = {
  counterPrice: "",
  moq: "",
  validity: "",
  remarks: "",
};

export const PRICE_REVISION_STATUSES = [
  "All Statuses",
  "pending_response",
  "accepted",
  "countered",
  "expired",
  "rejected",
  "completed",
] as const;

export const PRODUCT_GRADES = [
  "All Grades",
  "HDPE",
  "LLDPE",
  "PP Raffia",
  "PVC",
  "ABS",
  "PET",
] as const;

export const PRICE_REVISION_WAREHOUSES = [
  "All Warehouses",
  "Hazira",
  "Mundra",
  "Dahej",
  "JNPT",
  "Panipat",
  "Kandla",
] as const;

export const COUNTER_VALIDITY_OPTIONS: CounterValidity[] = [
  "3 Days",
  "7 Days",
  "15 Days",
  "30 Days",
];

export const PRICE_REVISION_STATUS_LABELS: Record<PriceRevisionStatus, string> =
  {
    pending_response: "Pending Response",
    countered: "Countered",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
    completed: "Completed",
  };

export const REJECT_REASONS = [
  "Price Not Acceptable",
  "Inventory Constraints",
  "Market Conditions Changed",
  "MOQ Mismatch",
  "Other",
] as const;

export type RejectReason = (typeof REJECT_REASONS)[number];

export function buildTimelineForStatus(
  status: PriceRevisionStatus,
  timestamps: {
    createdAt: string;
    viewedAt?: string;
    counterSubmittedAt?: string;
    adminReviewedAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
  },
): TimelineStep[] {
  const steps: Omit<TimelineStep, "status">[] = [
    {
      id: "tl-created",
      stage: "request_created",
      title: "Request Created",
      description: "Platform initiated price revision",
      actor: "PetroTrade Admin",
      timestamp: timestamps.createdAt,
    },
    {
      id: "tl-viewed",
      stage: "viewed_by_seller",
      title: "Viewed by Seller",
      description: "Revision opened in seller portal",
      actor: "Reliance Poly Industries",
      timestamp: timestamps.viewedAt,
    },
    {
      id: "tl-counter",
      stage: "counter_submitted",
      title: "Counter Submitted",
      description: "Seller counter offer sent for admin review",
      actor: "Reliance Poly Industries",
      timestamp: timestamps.counterSubmittedAt,
    },
    {
      id: "tl-admin",
      stage: "admin_reviewed",
      title: "Admin Reviewed",
      description: "PetroTrade admin evaluating counter",
      actor: "PetroTrade Admin",
      timestamp: timestamps.adminReviewedAt,
    },
    {
      id: "tl-accepted",
      stage: "accepted",
      title: "Accepted",
      description: "Revision accepted — pricing updated",
      actor: "PetroTrade Admin",
      timestamp: timestamps.acceptedAt,
    },
    {
      id: "tl-rejected",
      stage: "rejected",
      title: "Rejected",
      description: "Revision rejected by seller",
      actor: "Reliance Poly Industries",
      timestamp: timestamps.rejectedAt,
    },
  ];

  const visibleSteps =
    status === "rejected"
      ? steps.filter((s) => s.stage !== "accepted")
      : steps.filter((s) => s.stage !== "rejected");

  let foundCurrent = false;

  return visibleSteps.map((step) => {
    if (status === "rejected" && step.stage === "rejected") {
      return { ...step, status: "danger" as const };
    }

    if (status === "accepted" || status === "completed") {
      if (step.stage === "accepted" || step.timestamp) {
        return { ...step, status: "completed" as const };
      }
      return { ...step, status: "pending" as const };
    }

    if (status === "expired") {
      if (step.stage === "request_created") {
        return { ...step, status: "completed" as const };
      }
      if (!foundCurrent && step.stage === "viewed_by_seller") {
        foundCurrent = true;
        return { ...step, status: "danger" as const };
      }
      return { ...step, status: "pending" as const };
    }

    if (status === "countered") {
      if (
        step.stage === "request_created" ||
        step.stage === "viewed_by_seller" ||
        step.stage === "counter_submitted"
      ) {
        return {
          ...step,
          status: step.timestamp
            ? ("completed" as const)
            : ("current" as const),
        };
      }
      if (step.stage === "admin_reviewed" && !foundCurrent) {
        foundCurrent = true;
        return { ...step, status: "current" as const };
      }
      return { ...step, status: "pending" as const };
    }

    if (step.timestamp) {
      return { ...step, status: "completed" as const };
    }

    if (!foundCurrent) {
      foundCurrent = true;
      return { ...step, status: "current" as const };
    }

    return { ...step, status: "pending" as const };
  });
}
