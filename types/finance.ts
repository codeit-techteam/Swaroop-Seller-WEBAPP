export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SETTLED"
  | "OVERDUE"
  | "FAILED";

export type ReceivableStatus = "OPEN" | "PARTIAL" | "COLLECTED" | "OVERDUE";

export type CreditPolicyStatus = "ACTIVE" | "UNDER_REVIEW" | "EXHAUSTED" | "EXPIRED";

export interface FinanceSummary {
  totalReceivables: number;
  pendingPayments: number;
  settledAmount: number;
  overdueAmount: number;
  creditExposure: number;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderId: string;
  counterparty: string;
  amount: number;
  mode: "NEFT" | "RTGS" | "LC" | "UPI";
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
}

export interface ReceivableRecord {
  id: string;
  invoiceId: string;
  buyer: string;
  amount: number;
  outstanding: number;
  agingDays: number;
  status: ReceivableStatus;
  dueDate: string;
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
