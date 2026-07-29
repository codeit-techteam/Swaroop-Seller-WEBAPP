import type {
  PriceRevisionRequest,
  PriceRevisionStatus,
  PriceRevisionSummary,
  ProductGrade,
  RevisionReason,
} from "@/types/price-revision";
import { buildTimelineForStatus } from "@/types/price-revision";

export {
  COUNTER_VALIDITY_OPTIONS,
  PRICE_REVISION_STATUSES,
  PRICE_REVISION_WAREHOUSES,
  PRODUCT_GRADES,
} from "@/types/price-revision";

/** Anchor date aligned with Figma (Oct 2026 marketplace cycle). */
const REFERENCE = new Date("2026-07-29T07:31:00+05:30");

function isoOffset(hours: number): string {
  return new Date(REFERENCE.getTime() + hours * 3_600_000).toISOString();
}

function isoDaysOffset(days: number): string {
  return isoOffset(days * 24);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const PRODUCTS: Record<ProductGrade, { names: string[]; basePrice: number }> = {
  HDPE: {
    names: ["HDPE Blow Molding", "HDPE PE100 Pipe Grade", "HDPE Injection"],
    basePrice: 840,
  },
  LLDPE: {
    names: [
      "LLDPE Film Grade",
      "LLDPE Rotational Molding",
      "LLDPE Stretch Film",
    ],
    basePrice: 920,
  },
  "PP Raffia": {
    names: ["PP Raffia Grade", "PP Raffia T30S", "PP Raffia Yarn Grade"],
    basePrice: 880,
  },
  PVC: {
    names: ["PVC Resin SG5", "PVC Suspension Grade", "PVC Pipe Grade"],
    basePrice: 760,
  },
  ABS: {
    names: ["ABS Injection Grade", "ABS High Impact", "ABS General Purpose"],
    basePrice: 1120,
  },
  PET: {
    names: ["PET Bottle Grade", "PET Resin IV 0.80", "PET Sheet Grade"],
    basePrice: 980,
  },
};

const WAREHOUSES = [
  { code: "Mundra", label: "Mundra Port" },
  { code: "Hazira", label: "Hazira Port" },
  { code: "Dahej", label: "Dahej Zone" },
  { code: "JNPT", label: "JNPT Hub" },
  { code: "Panipat", label: "Panipat Refinery" },
  { code: "Kandla", label: "Kandla Port" },
] as const;

const REASONS: RevisionReason[] = [
  "Market Price Decreased",
  "Market Price Increased",
  "Supply Surplus",
  "Import Price Changes",
  "Global Crude Movement",
  "Regional Benchmark Shift",
];

const STATUS_POOL: PriceRevisionStatus[] = [
  "pending_response",
  "pending_response",
  "pending_response",
  "pending_response",
  "pending_response",
  "countered",
  "countered",
  "countered",
  "accepted",
  "accepted",
  "accepted",
  "accepted",
  "accepted",
  "rejected",
  "rejected",
  "expired",
  "expired",
  "completed",
  "completed",
  "pending_response",
  "countered",
  "accepted",
  "pending_response",
  "expired",
  "countered",
  "accepted",
  "pending_response",
  "rejected",
  "completed",
  "pending_response",
  "countered",
  "accepted",
  "expired",
  "pending_response",
  "countered",
  "accepted",
  "rejected",
  "completed",
  "pending_response",
  "countered",
];

function buildRequest(index: number): PriceRevisionRequest {
  const grades = Object.keys(PRODUCTS) as ProductGrade[];
  const grade = grades[index % grades.length]!;
  const productPool = PRODUCTS[grade];
  const productName = productPool.names[index % productPool.names.length]!;
  const warehouse = WAREHOUSES[index % WAREHOUSES.length]!;
  const status = STATUS_POOL[index % STATUS_POOL.length]!;
  const currentPrice = productPool.basePrice + (index % 7) * 5;
  const delta = status === "accepted" ? -25 : -15 - (index % 10);
  const suggestedPrice = Math.max(650, currentPrice + delta);
  const createdAt = isoDaysOffset(-(index % 14) - 1);
  const receivedAt = isoDaysOffset(-(index % 10));
  const batchNumber = `${22 + (index % 3)}-A${pad(100 + index)}`;

  let deadline: string;
  if (status === "expired") {
    deadline = isoOffset(-12 - (index % 48));
  } else if (
    status === "completed" ||
    status === "accepted" ||
    status === "rejected"
  ) {
    deadline = isoOffset(-24);
  } else if (index % 5 === 0) {
    deadline = isoOffset(14.5 + (index % 3));
  } else if (index % 5 === 1) {
    deadline = isoOffset(59 + (index % 12));
  } else {
    deadline = isoOffset(8 + (index % 20));
  }

  const viewedAt =
    status !== "pending_response" || index % 3 === 0
      ? isoDaysOffset(-(index % 5))
      : undefined;

  const counterSubmittedAt =
    status === "countered" || status === "completed"
      ? isoDaysOffset(-(index % 3))
      : undefined;

  const adminReviewedAt =
    status === "completed" ? isoDaysOffset(-1) : undefined;

  const acceptedAt =
    status === "accepted" || status === "completed"
      ? isoDaysOffset(-(index % 2))
      : undefined;

  const rejectedAt = status === "rejected" ? isoDaysOffset(-1) : undefined;

  const timeline = buildTimelineForStatus(status, {
    createdAt,
    viewedAt,
    counterSubmittedAt,
    adminReviewedAt,
    acceptedAt,
    rejectedAt,
  });

  const priceMin = suggestedPrice - 3;
  const priceMax = suggestedPrice + 3;

  const request: PriceRevisionRequest = {
    id: `pr-rev-${index + 1}`,
    requestId: `REV-${9942 - index}`,
    productName,
    productGrade: grade,
    batchNumber,
    currentPrice,
    suggestedPrice,
    reason: REASONS[index % REASONS.length]!,
    deadline,
    status,
    warehouse: warehouse.code,
    warehouseLabel: warehouse.label,
    inventoryMt: 1200 + (index % 8) * 350,
    moq: 50 + (index % 5) * 25,
    offerValidity: `${7 + (index % 4) * 7} Days`,
    marketRecommendation: {
      priceMin,
      priceMax,
      explanation:
        "Based on global indices and regional benchmark movement, PetroTrade recommends adjusting offer pricing to remain competitive while preserving margin integrity.",
      factors: [
        "Market demand softening in domestic segment",
        "Supply surplus from new plant capacity",
        "Import price changes from Middle East suppliers",
        "Global crude movement — Brent down 2.1%",
        "Regional benchmark — ICIS India adjusted lower",
      ].slice(0, 3 + (index % 3)),
    },
    timeline,
    receivedAt,
    createdAt,
    updatedAt: createdAt,
    viewedAt,
    acceptedAt,
  };

  if (status === "countered" || status === "completed") {
    request.counterOffer = {
      counterPrice: suggestedPrice + 2,
      moq: request.moq,
      validity: "7 Days",
      remarks:
        "Counter aligned with current warehouse inventory and dispatch schedule.",
      submittedAt: counterSubmittedAt ?? createdAt,
    };
  }

  if (status === "rejected") {
    request.rejectReason = "Price Not Acceptable";
  }

  return request;
}

export const priceRevisionRequestsMock: PriceRevisionRequest[] = Array.from(
  { length: 40 },
  (_, i) => buildRequest(i),
);

export function computePriceRevisionSummary(
  requests: PriceRevisionRequest[],
): PriceRevisionSummary {
  const monthStart = new Date(REFERENCE.getFullYear(), REFERENCE.getMonth(), 1);

  return {
    activeRequests: requests.filter((r) =>
      ["pending_response", "countered"].includes(r.status),
    ).length,
    acceptedMtd: requests.filter(
      (r) =>
        (r.status === "accepted" || r.status === "completed") &&
        r.acceptedAt &&
        new Date(r.acceptedAt) >= monthStart,
    ).length,
    pendingResponse: requests.filter((r) => r.status === "pending_response")
      .length,
    counterOffers: requests.filter((r) => r.status === "countered").length,
    expired: requests.filter((r) => r.status === "expired").length,
  };
}

export const priceRevisionSummaryMock = computePriceRevisionSummary(
  priceRevisionRequestsMock,
);
