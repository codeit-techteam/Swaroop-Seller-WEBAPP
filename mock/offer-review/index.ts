import type {
  AdminFeedback,
  OfferReview,
  OfferReviewDocument,
  OfferReviewStatus,
  OfferReviewSummary,
  OfferReviewTimelineStep,
  OfferVersion,
  RequestedChange,
} from "@/types/offer-review";

export const productGrades = [
  "PP",
  "HDPE",
  "LLDPE",
  "PVC",
  "ABS",
  "PET",
  "Bitumen",
  "Methanol",
] as const;

export const warehouses = [
  "Mundra Port",
  "Hazira Terminal",
  "Jamnagar Refinery",
  "Kandla Port",
  "Dahej SEZ",
  "Vadodara Hub",
  "Ahmedabad Depot",
] as const;

export const offerReviewStatusOptions: (OfferReviewStatus | "all")[] = [
  "all",
  "pending_review",
  "needs_changes",
  "approved",
  "published",
  "rejected",
  "withdrawn",
];

export const productGradeOptions = ["all", ...productGrades] as const;
export const warehouseOptions = ["all", ...warehouses] as const;

const reviewers = ["Rajesh K.", "Priya M.", "Amit S.", "Neha R.", "Vikram P."];

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildDocuments(seed: number): OfferReviewDocument[] {
  const docs: OfferReviewDocument[] = [
    {
      id: `doc-coa-${seed}`,
      name: "Certificate_of_Analysis.pdf",
      fileType: "PDF",
      sizeLabel: "1.2 MB",
      category: "coa",
    },
    {
      id: `doc-inv-${seed}`,
      name: "Inventory_Report.xlsx",
      fileType: "XLSX",
      sizeLabel: "840 KB",
      category: "inventory_report",
    },
    {
      id: `doc-qc-${seed}`,
      name: "Quality_Certificate.pdf",
      fileType: "PDF",
      sizeLabel: "620 KB",
      category: "quality_certificate",
    },
    {
      id: `doc-spec-${seed}`,
      name: "Specification_Sheet.pdf",
      fileType: "PDF",
      sizeLabel: "450 KB",
      category: "specification_sheet",
    },
  ];
  return seed % 3 === 0 ? docs.slice(0, 3) : docs;
}

function buildTimeline(
  status: OfferReviewStatus,
  submittedDaysAgo: number,
  reviewer: string,
): OfferReviewTimelineStep[] {
  const submitted = daysAgo(submittedDaysAgo);
  const reviewStarted = daysAgo(submittedDaysAgo - 0);
  const changesRequested = daysAgo(submittedDaysAgo - 1);
  const approved = daysAgo(submittedDaysAgo - 3);
  const published = daysAgo(submittedDaysAgo - 5);

  const base: OfferReviewTimelineStep[] = [
    {
      id: "tl-submitted",
      stage: "submitted",
      title: "Submitted",
      timestamp: submitted,
      status: "completed",
    },
    {
      id: "tl-review",
      stage: "review_started",
      title: "Review Started",
      description: reviewer,
      timestamp: reviewStarted,
      status: "completed",
      reviewer,
    },
  ];

  switch (status) {
    case "pending_review":
      return [
        ...base,
        {
          id: "tl-pending",
          stage: "approved",
          title: "Approved",
          status: "pending",
        },
      ];
    case "needs_changes":
      return [
        ...base,
        {
          id: "tl-changes",
          stage: "changes_requested",
          title: "Changes Requested",
          timestamp: changesRequested,
          status: "current",
        },
      ];
    case "approved":
      return [
        ...base,
        {
          id: "tl-approved",
          stage: "approved",
          title: "Approved",
          timestamp: approved,
          status: "current",
        },
      ];
    case "published":
      return [
        ...base,
        {
          id: "tl-approved",
          stage: "approved",
          title: "Approved",
          timestamp: approved,
          status: "completed",
        },
        {
          id: "tl-published",
          stage: "published",
          title: "Published",
          timestamp: published,
          status: "current",
        },
      ];
    case "rejected":
      return [
        ...base,
        {
          id: "tl-rejected",
          stage: "rejected",
          title: "Rejected",
          timestamp: changesRequested,
          status: "current",
        },
      ];
    case "withdrawn":
      return [
        ...base,
        {
          id: "tl-withdrawn",
          stage: "rejected",
          title: "Withdrawn by Seller",
          timestamp: changesRequested,
          status: "danger",
        },
      ];
    default:
      return base.slice(0, 1);
  }
}

function buildRequestedChanges(
  status: OfferReviewStatus,
  basePrice: number,
): RequestedChange[] {
  if (status !== "needs_changes") return [];

  const ceiling = Math.round(basePrice * 0.955 * 100) / 100;
  return [
    {
      id: "rc-price",
      field: "Base Price",
      currentValue: `₹${basePrice.toFixed(2)} / MT`,
      marketCeiling: `₹${ceiling.toFixed(2)} / MT`,
      actionRequired: true,
    },
  ];
}

function buildAdminFeedback(status: OfferReviewStatus): AdminFeedback | null {
  if (status === "needs_changes") {
    return {
      title: "Admin Feedback",
      message:
        "Base price exceeds market ceiling for Mundra region by 5%. Please revise pricing to align with current market rates before re-submission.",
      type: "warning",
    };
  }
  if (status === "rejected") {
    return {
      title: "Rejection Reason",
      message:
        "Offer does not meet minimum quality specifications for the selected product grade. Please update COA documentation and resubmit.",
      type: "danger",
    };
  }
  if (status === "pending_review") {
    return {
      title: "Review In Progress",
      message:
        "Your offer is currently under review by the PetroTrade compliance team. Expected turnaround: 1-2 business days.",
      type: "info",
    };
  }
  return null;
}

function buildVersionHistory(
  status: OfferReviewStatus,
  submittedDaysAgo: number,
): OfferVersion[] {
  const v1: OfferVersion = {
    id: "v1",
    version: 1,
    label: "Submitted",
    timestamp: daysAgo(submittedDaysAgo),
  };

  if (status === "needs_changes") {
    return [
      { ...v1, isLatest: false },
      {
        id: "v2",
        version: 2,
        label: "Requested Changes",
        timestamp: daysAgo(submittedDaysAgo - 1),
        isLatest: true,
      },
    ];
  }

  if (status === "approved" || status === "published") {
    return [
      { ...v1, isLatest: false },
      {
        id: "v2",
        version: 2,
        label: "Requested Changes",
        timestamp: daysAgo(submittedDaysAgo - 2),
        isLatest: false,
      },
      {
        id: "v3",
        version: 3,
        label: "Re-submitted",
        timestamp: daysAgo(submittedDaysAgo - 3),
        isLatest: false,
      },
      {
        id: "v4",
        version: 4,
        label: status === "published" ? "Published" : "Approved",
        timestamp: daysAgo(submittedDaysAgo - 5),
        isLatest: true,
      },
    ];
  }

  return [{ ...v1, isLatest: true }];
}

const statusDistribution: OfferReviewStatus[] = [
  ...Array<OfferReviewStatus>(8).fill("pending_review"),
  ...Array<OfferReviewStatus>(6).fill("needs_changes"),
  ...Array<OfferReviewStatus>(14).fill("approved"),
  ...Array<OfferReviewStatus>(10).fill("published"),
  ...Array<OfferReviewStatus>(5).fill("rejected"),
  ...Array<OfferReviewStatus>(4).fill("withdrawn"),
  ...Array<OfferReviewStatus>(3).fill("draft"),
];

function buildOffer(index: number): OfferReview {
  const seed = index + 1;
  const status =
    index === 0
      ? "needs_changes"
      : (statusDistribution[index] ?? "pending_review");
  const productGrade =
    index === 0 ? "PP" : productGrades[index % productGrades.length]!;
  const warehouse =
    index === 0 ? "Mundra Port" : warehouses[index % warehouses.length]!;
  const quantityMt = index === 0 ? 500 : 50 + (index % 20) * 25;
  const basePrice = index === 0 ? 842.5 : 680 + (index % 15) * 12.5;
  const submittedDaysAgo = index === 0 ? 9 : 1 + (index % 45);
  const reviewer =
    index === 0 ? "Rajesh K." : reviewers[index % reviewers.length]!;
  const offerId =
    index === 0 ? "PR-99281" : `PR-${String(99000 + seed).slice(-5)}`;

  return {
    id: `or-${seed}`,
    offerId,
    productGrade,
    warehouse,
    quantityMt,
    basePrice,
    currency: "INR",
    submittedAt: daysAgo(submittedDaysAgo),
    status,
    timeline: buildTimeline(status, submittedDaysAgo, reviewer),
    adminFeedback: buildAdminFeedback(status),
    requestedChanges: buildRequestedChanges(status, basePrice),
    documents: buildDocuments(seed),
    versionHistory: buildVersionHistory(status, submittedDaysAgo),
  };
}

export const offerReviewsMock: OfferReview[] = Array.from(
  { length: 50 },
  (_, index) => buildOffer(index),
);

export function computeOfferReviewSummary(
  offers: OfferReview[],
): OfferReviewSummary {
  return {
    totalSubmitted: offers.filter((o) => o.status !== "draft").length,
    pendingReview: offers.filter((o) => o.status === "pending_review").length,
    approved: offers.filter(
      (o) => o.status === "approved" || o.status === "published",
    ).length,
    needsChanges: offers.filter((o) => o.status === "needs_changes").length,
    rejected: offers.filter((o) => o.status === "rejected").length,
  };
}

export const offerReviewSummaryMock =
  computeOfferReviewSummary(offerReviewsMock);
