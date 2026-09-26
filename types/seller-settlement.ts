export type SellerSettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "RELEASED"
  | "FAILED"
  | "CANCELLED"
  | "ON_HOLD";

export interface BlindBuyerRef {
  displayName: string;
  reference: string;
}

export interface SellerSettlementTimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string | null;
  status: "completed" | "current" | "pending";
  at: string;
  source: string;
}

export interface SellerSettlementDeductionLine {
  code: string;
  label: string;
  amount: number;
}

export interface SellerSettlement {
  id: string;
  settlementNumber: string;
  referenceNumber: string;
  purchaseOrderId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  proformaInvoiceId: string | null;
  proformaInvoiceNumber: string | null;
  status: SellerSettlementStatus;
  currency: string;
  grossAmount: number;
  taxAmount: number;
  platformFee: number;
  tdsAmount: number;
  otherDeductions: number;
  deductions: number;
  netAmount: number;
  settlementDate: string | null;
  releasedAt: string | null;
  expectedSettlementDate: string | null;
  buyer: BlindBuyerRef;
  createdAt: string;
  updatedAt: string;
}

export interface SellerSettlementDetail extends SellerSettlement {
  relatedPurchaseOrder: {
    id: string;
    referenceNumber: string;
    quantity: string | null;
    unit: string;
    unitPrice: number | null;
    orderValue: number | null;
    productName: string | null;
    gradeName: string | null;
  } | null;
  relatedInvoice: {
    id: string;
    invoiceNumber: string | null;
    status: string | null;
  } | null;
  relatedProformaInvoice: {
    id: string;
    piNumber: string | null;
    status: string | null;
  } | null;
  relatedPayment: {
    id: string;
    referenceNumber: string;
    status: string;
    utr: string | null;
    amount: number;
    paidAt: string | null;
    verifiedAt: string | null;
  } | null;
  deductionBreakdown: SellerSettlementDeductionLine[];
  items: Array<{
    id: string;
    description: string | null;
    amount: number;
    paymentId: string | null;
    paymentReference: string | null;
  }>;
  pendingReason: string | null;
  timeline: SellerSettlementTimelineEvent[];
}

export interface SellerSettlementSummary {
  totalSales: number;
  settledAmount: number;
  pendingSettlementAmount: number;
  outstandingSettlementAmount: number;
  nextSettlementAmount: number | null;
  nextSettlementId: string | null;
  nextSettlementNumber: string | null;
  totalCount: number;
  byStatus: Record<
    string,
    { count: number; grossAmount: number; netAmount: number }
  >;
}

export interface SellerSettlementListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerSettlementStatus | "ALL" | "all";
  sortBy?:
    "createdAt" | "settlementDate" | "grossAmount" | "netAmount" | "status";
  sortOrder?: "asc" | "desc";
}

export interface SellerSettlementPage {
  items: SellerSettlement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const settlementStatusConfig: Record<
  SellerSettlementStatus,
  { label: string }
> = {
  PENDING: { label: "Pending" },
  PROCESSING: { label: "Processing" },
  READY: { label: "Ready" },
  RELEASED: { label: "Settled" },
  FAILED: { label: "Failed" },
  CANCELLED: { label: "Cancelled" },
  ON_HOLD: { label: "On Hold" },
};

export const SETTLEMENT_STATUS_FILTERS: Array<{
  value: "all" | SellerSettlementStatus;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY", label: "Ready" },
  { value: "RELEASED", label: "Settled" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];
