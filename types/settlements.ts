import type { SortDirection } from "./common";

export type SettlementStatus =
  "pending" | "processing" | "settled" | "failed" | "on_hold" | "disputed";

export type PaymentMode = "NEFT" | "RTGS" | "IMPS" | "UPI";

export type WarehouseCode = "Hazira" | "Dahej" | "JNPT" | "Mundra" | "Kandla";

export type SettlementTimelineStepKey =
  | "order_delivered"
  | "invoice_verified"
  | "quality_check_passed"
  | "commission_calculated"
  | "gst_adjustment"
  | "funds_approved"
  | "funds_disbursed"
  | "completed";

export type SettlementTimelineStepStatus = "completed" | "current" | "pending";

/** @deprecated Use SettlementTimelineStepKey */
export type TimelineStepKey = SettlementTimelineStepKey;

/** @deprecated Use SettlementTimelineStepStatus */
export type TimelineStepStatus = SettlementTimelineStepStatus;

export type SettlementSortKey =
  | "settlementId"
  | "orderRef"
  | "product"
  | "quantityMt"
  | "invoiceAmount"
  | "netSettlement"
  | "paymentDate"
  | "status";

export type SettlementDialogType =
  "invoice" | "receipt" | "view_settlement" | null;

export interface SettlementTimelineStep {
  key: TimelineStepKey;
  label: string;
  timestamp?: string;
  status: TimelineStepStatus;
}

export interface SettlementAudit {
  grossInvoiceValue: number;
  commissionRate: number;
  commissionAmount: number;
  tdsRate: number;
  tdsAmount: number;
  gstReversal: number;
  inputTaxCredit: number;
  platformCharges: number;
  otherAdjustments: number;
  netSettlement: number;
}

export interface PaymentDetails {
  utrNumber?: string;
  transferDate?: string;
  paymentMode: PaymentMode;
  bankName: string;
  maskedAccountNumber: string;
  paymentReference?: string;
  status: SettlementStatus;
}

export interface Settlement {
  id: string;
  settlementId: string;
  orderRef: string;
  invoiceId: string;
  buyerCompany: string;
  product: string;
  material: string;
  warehouse: WarehouseCode;
  quantityMt: number;
  invoiceAmount: number;
  netSettlement: number;
  paymentDate: string | null;
  estimatedPaymentDate?: string;
  status: SettlementStatus;
  timeline: SettlementTimelineStep[];
  audit: SettlementAudit;
  paymentDetails: PaymentDetails;
  createdAt: string;
}

export interface SettlementFilters {
  search: string;
  status: SettlementStatus | "all";
  warehouse: WarehouseCode | "all";
  paymentMethod: PaymentMode | "all";
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
}

export interface SettlementSummary {
  grossRevenue: number;
  pendingSettlement: number;
  settledAmount: number;
  commissionDeducted: number;
}

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  settled: "Settled",
  failed: "Failed",
  on_hold: "On Hold",
  disputed: "Disputed",
};

export const SETTLEMENT_STATUSES: Array<SettlementStatus | "all"> = [
  "all",
  "pending",
  "processing",
  "settled",
  "failed",
  "on_hold",
  "disputed",
];

export const SETTLEMENT_WAREHOUSES: Array<WarehouseCode | "all"> = [
  "all",
  "Hazira",
  "Dahej",
  "JNPT",
  "Mundra",
  "Kandla",
];

export const PAYMENT_MODES: Array<PaymentMode | "all"> = [
  "all",
  "NEFT",
  "RTGS",
  "IMPS",
  "UPI",
];

export const TIMELINE_STEP_LABELS: Record<TimelineStepKey, string> = {
  order_delivered: "Order Delivered",
  invoice_verified: "Invoice Verified",
  quality_check_passed: "Quality Check Passed",
  commission_calculated: "Commission Calculated",
  gst_adjustment: "GST Adjustment",
  funds_approved: "Funds Approved",
  funds_disbursed: "Funds Disbursed",
  completed: "Completed",
};

export const TIMELINE_STEP_ORDER: TimelineStepKey[] = [
  "order_delivered",
  "invoice_verified",
  "quality_check_passed",
  "commission_calculated",
  "gst_adjustment",
  "funds_approved",
  "funds_disbursed",
  "completed",
];

export interface SettlementSort {
  key: SettlementSortKey;
  direction: SortDirection;
}

export function computeSettlementAudit(params: {
  grossInvoiceValue: number;
  commissionRate?: number;
  tdsRate?: number;
  gstReversal?: number;
  inputTaxCredit?: number;
  platformCharges?: number;
  otherAdjustments?: number;
}): SettlementAudit {
  const commissionRate = params.commissionRate ?? 5.5;
  const tdsRate = params.tdsRate ?? 1;
  const gstReversal = params.gstReversal ?? 0;
  const inputTaxCredit = params.inputTaxCredit ?? 0;
  const platformCharges = params.platformCharges ?? 0;
  const otherAdjustments = params.otherAdjustments ?? 0;

  const commissionAmount = Math.round(
    (params.grossInvoiceValue * commissionRate) / 100,
  );
  const tdsAmount = Math.round((params.grossInvoiceValue * tdsRate) / 100);
  const netSettlement =
    params.grossInvoiceValue -
    commissionAmount -
    tdsAmount +
    gstReversal +
    inputTaxCredit -
    platformCharges -
    otherAdjustments;

  return {
    grossInvoiceValue: params.grossInvoiceValue,
    commissionRate,
    commissionAmount,
    tdsRate,
    tdsAmount,
    gstReversal,
    inputTaxCredit,
    platformCharges,
    otherAdjustments,
    netSettlement,
  };
}
