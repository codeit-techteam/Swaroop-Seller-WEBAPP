export type OfferStatus =
  | "active"
  | "paused"
  | "expired"
  | "draft"
  | "pending_review"
  | "approved"
  | "need_changes"
  | "rejected";

export type OfferTab = "all" | "active" | "paused" | "expired" | "draft";

export type PaymentTerm =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export type OfferSortBy =
  "newest" | "oldest" | "price_desc" | "price_asc" | "moq" | "grade";

export interface PricingTier {
  id: string;
  label: string;
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  unitPrice: number;
  savingsPerMt: number;
}

export interface Offer {
  id: string;
  offerId: string;
  productId: string;
  productName: string;
  productGrade: string;
  productSubtext: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  basePrice: number;
  quantityMt: number;
  moq: number;
  allocationMt: number;
  availableInventoryMt: number;
  visibility: boolean;
  status: OfferStatus;
  validUntil: string;
  paymentTerms: PaymentTerm[];
  remarks: string;
  tiers: PricingTier[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferSummary {
  totalLive: number;
  pendingReview: number;
  approved: number;
  needChanges: number;
}

export interface OfferFilters {
  search: string;
  tab: OfferTab;
  warehouse: string;
  category: string;
  status: string;
  paymentTerm: string;
  validityFrom: string;
  validityTo: string;
  priceMin: string;
  priceMax: string;
  moqMin: string;
  moqMax: string;
  dateFrom: string;
  dateTo: string;
  sortBy: OfferSortBy;
}

export interface OfferFormData {
  productId: string;
  productName: string;
  productGrade: string;
  productSubtext: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  availableInventoryMt: number;
  allocationMt: number;
  basePrice: number;
  moq: number;
  validUntil: string;
  paymentTerms: PaymentTerm[];
  remarks: string;
  tiers: PricingTier[];
}

export interface LivePricingStats {
  unitPrice: number;
  maxDiscount: number;
  totalSavings: number;
  estimatedRevenue: number;
  buyerVisiblePrice: number;
  lowestLandedCost: number;
}

export const defaultOfferTiers = (basePrice = 0): PricingTier[] => [
  {
    id: "tier-1",
    label: "TIER 1",
    minQty: 1,
    maxQty: 10,
    discountPercent: 0,
    unitPrice: basePrice,
    savingsPerMt: 0,
  },
  {
    id: "tier-2",
    label: "TIER 2",
    minQty: 10,
    maxQty: 50,
    discountPercent: 2.5,
    unitPrice: Math.round(basePrice * 0.975 * 100) / 100,
    savingsPerMt: Math.round(basePrice * 0.025 * 100) / 100,
  },
  {
    id: "tier-3",
    label: "TIER 3",
    minQty: 50,
    maxQty: null,
    discountPercent: 5,
    unitPrice: Math.round(basePrice * 0.95 * 100) / 100,
    savingsPerMt: Math.round(basePrice * 0.05 * 100) / 100,
  },
];

export const defaultOfferFormData = (): OfferFormData => ({
  productId: "",
  productName: "",
  productGrade: "",
  productSubtext: "",
  category: "",
  warehouseId: "",
  warehouseName: "",
  availableInventoryMt: 0,
  allocationMt: 0,
  basePrice: 0,
  moq: 5,
  validUntil: "",
  paymentTerms: ["advance", "credit_15"],
  remarks: "",
  tiers: defaultOfferTiers(),
});

export function computeLivePricing(form: OfferFormData): LivePricingStats {
  const maxDiscount = form.tiers.reduce(
    (max, tier) => Math.max(max, tier.discountPercent),
    0,
  );
  const lowestTier =
    form.tiers.length > 0
      ? form.tiers.reduce((min, tier) =>
          tier.unitPrice < min.unitPrice ? tier : min,
        )
      : null;
  const buyerVisiblePrice = lowestTier?.unitPrice ?? form.basePrice;
  const totalSavingsPerMt = form.basePrice - buyerVisiblePrice;
  const allocation = form.allocationMt || 0;

  return {
    unitPrice: form.basePrice,
    maxDiscount,
    totalSavings: Math.round(totalSavingsPerMt * allocation * 100) / 100,
    estimatedRevenue: Math.round(buyerVisiblePrice * allocation * 100) / 100,
    buyerVisiblePrice,
    lowestLandedCost: buyerVisiblePrice,
  };
}

export function tiersOverlap(tiers: PricingTier[]): boolean {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]!;
    const next = sorted[i + 1]!;
    const currentMax = current.maxQty ?? Number.POSITIVE_INFINITY;
    if (currentMax > next.minQty) return true;
  }
  return false;
}
