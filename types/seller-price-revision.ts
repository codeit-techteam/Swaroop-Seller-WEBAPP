export type SellerPriceRevisionStatus =
  | "PENDING"
  | "AWAITING_RESPONSE"
  | "COUNTER_OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export interface BlindBuyer {
  displayName: string;
  reference: string;
}

export interface SellerPriceRevision {
  id: string;
  requestNumber: string;
  purchaseRequestId: string | null;
  offerId: string | null;
  purchaseRequestReference: string | null;
  orderReference: string | null;
  status: SellerPriceRevisionStatus;
  backendStatus: string;
  buyer: BlindBuyer;
  product: { id: string; code: string; name: string } | null;
  grade: {
    id: string;
    code: string;
    name: string;
    displayName: string;
  } | null;
  originalPrice: number;
  requestedPrice: number;
  differenceAmount: number;
  differencePercent: number;
  quantity: number;
  unit: string;
  totalValue: number;
  currency: string;
  reason: string | null;
  paymentMethod: string | null;
  deliveryRegion: string | null;
  requestedDelivery: string | null;
  requestedOn: string;
  requestedAt: string;
  responseDeadline: string | null;
  deadlineExpired: boolean;
  allowedActions: string[];
  counterPrice: number | null;
  timeline: Array<{
    id: string;
    actorRole: string;
    actorLabel: string;
    unitPrice: number;
    quantity: number;
    note: string | null;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SellerPriceRevisionSummary {
  pending: number;
  awaitingResponse: number;
  accepted: number;
  counterOffers: number;
  rejected: number;
  expired?: number;
  cancelled?: number;
}

export interface SellerPriceRevisionListParams {
  page?: number;
  limit?: number;
  status?: string;
  gradeId?: string;
  from?: string;
  to?: string;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  search?: string;
}

export interface SellerPriceRevisionPage {
  items: SellerPriceRevision[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const priceRevisionStatusConfig: Record<
  SellerPriceRevisionStatus,
  { label: string }
> = {
  PENDING: { label: "Pending" },
  AWAITING_RESPONSE: { label: "Awaiting Response" },
  COUNTER_OFFER: { label: "Counter Offer" },
  ACCEPTED: { label: "Accepted" },
  REJECTED: { label: "Rejected" },
  EXPIRED: { label: "Expired" },
  CANCELLED: { label: "Cancelled" },
};
