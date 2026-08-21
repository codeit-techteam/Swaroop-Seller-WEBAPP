import { buildPaymentTrack } from "@/lib/utils/payment-track";
import type {
  CreditInsurancePolicy,
  FinanceSummary,
  PaymentMode,
  PaymentRecord,
  PaymentStatus,
  ReceivableRecord,
} from "@/types/finance";

export const financeSummaryMock: FinanceSummary = {
  totalReceivables: 4_20_00_000,
  pendingPayments: 85_00_000,
  settledAmount: 12_40_00_000,
  overdueAmount: 12_40_000,
  creditExposure: 3_10_00_000,
};

type PaymentSeed = {
  id: string;
  paymentId: string;
  orderId: string;
  counterparty: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  creditDays?: number;
  direction?: "INBOUND" | "OUTBOUND";
};

const paymentSeeds: PaymentSeed[] = [
  {
    id: "pay-1",
    paymentId: "PAY-8832",
    orderId: "PC-98280",
    counterparty: "Time Technoplast",
    amount: 85_00_000,
    mode: "ADVANCE",
    status: "PENDING",
    dueDate: "2024-05-18",
    direction: "INBOUND",
  },
  {
    id: "pay-2",
    paymentId: "PAY-8821",
    orderId: "PC-98271",
    counterparty: "Supreme Industries",
    amount: 1_20_00_000,
    mode: "ON_LOADING",
    status: "PROCESSING",
    dueDate: "2024-05-16",
    direction: "INBOUND",
  },
  {
    id: "pay-3",
    paymentId: "PAY-8810",
    orderId: "PC-98267",
    counterparty: "HPCL",
    amount: 2_40_00_000,
    mode: "CREDIT",
    status: "SETTLED",
    dueDate: "2024-05-10",
    paidAt: "2024-05-10",
    creditDays: 30,
    direction: "INBOUND",
  },
  {
    id: "pay-4",
    paymentId: "PAY-8802",
    orderId: "PC-98244",
    counterparty: "GAIL India",
    amount: 12_40_000,
    mode: "ON_DELIVERY",
    status: "OVERDUE",
    dueDate: "2024-05-08",
    direction: "INBOUND",
  },
  {
    id: "pay-5",
    paymentId: "PAY-8794",
    orderId: "PC-98231",
    counterparty: "Indorama Ventures",
    amount: 48_50_000,
    mode: "ADVANCE",
    status: "FAILED",
    dueDate: "2024-05-14",
    direction: "INBOUND",
  },
  {
    id: "pay-6",
    paymentId: "PAY-8788",
    orderId: "PC-98219",
    counterparty: "Uflex Ltd",
    amount: 96_00_000,
    mode: "CREDIT",
    status: "PENDING",
    dueDate: "2024-05-28",
    creditDays: 15,
    direction: "INBOUND",
  },
  {
    id: "pay-7",
    paymentId: "PAY-8775",
    orderId: "PC-98205",
    counterparty: "Finolex Industries",
    amount: 62_00_000,
    mode: "ON_LOADING",
    status: "SETTLED",
    dueDate: "2024-05-12",
    paidAt: "2024-05-12",
    direction: "INBOUND",
  },
  {
    id: "pay-8",
    paymentId: "PAY-8761",
    orderId: "PC-98190",
    counterparty: "Reliance Polymers",
    amount: 1_85_00_000,
    mode: "ON_DELIVERY",
    status: "PROCESSING",
    dueDate: "2024-05-20",
    direction: "INBOUND",
  },
];

export const paymentsMock: PaymentRecord[] = paymentSeeds.map((seed) => ({
  ...seed,
  track: buildPaymentTrack(seed.mode, seed.status, seed.dueDate, seed.paidAt),
}));

export const receivablesMock: ReceivableRecord[] = [
  {
    id: "rec-1",
    invoiceId: "INV-5512",
    customer: "Indorama Ventures",
    amount: 2_18_00_000,
    outstanding: 2_18_00_000,
    agingDays: 12,
    status: "OPEN",
    dueDate: "2024-05-22",
    creditDays: 30,
  },
  {
    id: "rec-2",
    invoiceId: "INV-5498",
    customer: "Supreme Industries",
    amount: 1_64_00_000,
    outstanding: 64_00_000,
    agingDays: 21,
    status: "PARTIAL",
    dueDate: "2024-05-12",
    creditDays: 15,
    lastPaymentAt: "2024-05-08",
  },
  {
    id: "rec-3",
    invoiceId: "INV-5471",
    customer: "HPCL",
    amount: 3_10_00_000,
    outstanding: 0,
    agingDays: 0,
    status: "COLLECTED",
    dueDate: "2024-05-05",
    creditDays: 30,
    lastPaymentAt: "2024-05-05",
  },
  {
    id: "rec-4",
    invoiceId: "INV-5460",
    customer: "GAIL India",
    amount: 12_40_000,
    outstanding: 12_40_000,
    agingDays: 38,
    status: "OVERDUE",
    dueDate: "2024-04-28",
    creditDays: 15,
  },
];

export const creditPoliciesMock: CreditInsurancePolicy[] = [
  {
    id: "ci-1",
    policyId: "CI-REL-441",
    buyer: "Indorama Ventures",
    insurer: "ECG C",
    coverAmount: 5_00_00_000,
    utilized: 2_18_00_000,
    status: "ACTIVE",
    validFrom: "2024-01-01",
    validUntil: "2024-12-31",
    coverType: "Buyer default",
    lastReviewedAt: "2024-06-12",
    notes: "Healthy headroom. Next review scheduled with Q3 shipment plan.",
  },
  {
    id: "ci-2",
    policyId: "CI-REL-442",
    buyer: "Time Technoplast",
    insurer: "New India Assurance",
    coverAmount: 2_50_00_000,
    utilized: 2_45_00_000,
    status: "UNDER_REVIEW",
    validFrom: "2024-01-15",
    validUntil: "2024-09-30",
    coverType: "Buyer default",
    lastReviewedAt: "2024-05-28",
    notes: "Near limit — underwriter reviewing top-up request for ₹50 L.",
  },
  {
    id: "ci-3",
    policyId: "CI-REL-418",
    buyer: "Uflex Ltd",
    insurer: "HDFC ERGO",
    coverAmount: 1_80_00_000,
    utilized: 1_80_00_000,
    status: "EXHAUSTED",
    validFrom: "2023-08-16",
    validUntil: "2024-08-15",
    coverType: "Whole turnover",
    lastReviewedAt: "2024-05-02",
    notes: "Cover fully drawn. New orders blocked until limit reset or top-up.",
  },
  {
    id: "ci-4",
    policyId: "CI-REL-390",
    buyer: "Finolex Industries",
    insurer: "ICICI Lombard",
    coverAmount: 90_00_000,
    utilized: 0,
    status: "EXPIRED",
    validFrom: "2023-04-01",
    validUntil: "2024-03-31",
    coverType: "Buyer default",
    lastReviewedAt: "2024-03-20",
    notes: "Policy lapsed. Renewal quote pending buyer financials.",
  },
];
