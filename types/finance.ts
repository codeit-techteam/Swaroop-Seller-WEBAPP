export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "OVERDUE"
  | "FAILED";

export type PaymentMode =
  | "ADVANCE"
  | "ON_LOADING"
  | "ON_DELIVERY"
  | "CREDIT";

export type PaymentTrackStepStatus =
  | "completed"
  | "current"
  | "upcoming"
  | "failed";

export type ReceivableStatus = "OPEN" | "PARTIAL" | "COLLECTED" | "OVERDUE";

export type CreditPolicyStatus =
  | "ACTIVE"
  | "UNDER_REVIEW"
  | "EXHAUSTED"
  | "EXPIRED";

export interface FinanceSummary {
  totalReceivables: number;
  pendingPayments: number;
  settledAmount: number;
  overdueAmount: number;
  creditExposure: number;
}

export interface PaymentTrackStep {
  key: string;
  label: string;
  description?: string;
  status: PaymentTrackStepStatus;
  at?: string;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderId: string;
  counterparty: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  track: PaymentTrackStep[];
  creditDays?: number;
  direction?: "INBOUND" | "OUTBOUND";
}

export interface ReceivableRecord {
  id: string;
  invoiceId: string;
  customer: string;
  amount: number;
  outstanding: number;
  agingDays: number;
  status: ReceivableStatus;
  dueDate: string;
  creditDays: number;
  lastPaymentAt?: string;
}

export interface CreditInsurancePolicy {
  id: string;
  policyId: string;
  buyer: string;
  insurer: string;
  coverAmount: number;
  utilized: number;
  status: CreditPolicyStatus;
  validUntil: string;
}

export const PAYMENT_MODES: PaymentMode[] = [
  "ADVANCE",
  "ON_LOADING",
  "ON_DELIVERY",
  "CREDIT",
];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  ADVANCE: "Advance",
  ON_LOADING: "On Loading",
  ON_DELIVERY: "On Delivery",
  CREDIT: "Credit",
};
