import {
  computeSettlementAudit,
  type PaymentDetails,
  type PaymentMode,
  type Settlement,
  type SettlementStatus,
  type SettlementSummary,
  type SettlementTimelineStep,
  TIMELINE_STEP_LABELS,
  TIMELINE_STEP_ORDER,
  type WarehouseCode,
} from "@/types/settlements";

const PRODUCTS = [
  { name: "Low Sulfur Fuel Oil (LSFO)", material: "LSFO 0.5% S" },
  { name: "Gas Oil (HSD)", material: "HSD 10ppm" },
  { name: "Naphtha", material: "Light Naphtha" },
  { name: "Petroleum Coke", material: "Fuel Grade Coke" },
  { name: "Bitumen VG-30", material: "VG-30 Grade" },
  { name: "LPG Bulk", material: "Commercial LPG" },
  { name: "Motor Spirit (MS)", material: "BS-VI Petrol" },
  { name: "High Speed Diesel", material: "HSD BS-VI" },
  { name: "Aviation Turbine Fuel", material: "ATF Jet A-1" },
  { name: "Propylene", material: "Polymer Grade" },
] as const;

const WAREHOUSES: WarehouseCode[] = [
  "Hazira",
  "Dahej",
  "JNPT",
  "Mundra",
  "Kandla",
];

const BUYERS = [
  "Reliance Petroleum Trading",
  "Bharat Fuel Distributors",
  "Coastal Energy Corp",
  "Western Refineries Ltd",
  "Summit Petrochem",
  "Orion Bulk Fuels",
  "Vertex Energy Solutions",
  "Horizon Oil & Gas",
  "Delta Hydrocarbons",
  "Prime Fuel Industries",
  "Atlas Energy Trading",
  "Quantum Petrochemicals",
  "Nova Energy Partners",
  "Apex Fuel Logistics",
  "Sterling Oil Merchants",
];

const BANKS = ["HDFC Bank", "ICICI Bank", "Axis Bank", "SBI", "Kotak Mahindra"];
const PAYMENT_MODES: PaymentMode[] = ["NEFT", "RTGS", "IMPS", "UPI"];

const STATUSES: SettlementStatus[] = [
  "settled",
  "settled",
  "settled",
  "processing",
  "processing",
  "pending",
  "pending",
  "failed",
  "on_hold",
  "disputed",
];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function padRef(num: number, width = 4): string {
  return String(num).padStart(width, "0");
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function statusProgress(status: SettlementStatus): number {
  switch (status) {
    case "pending":
      return 2;
    case "processing":
      return 6;
    case "settled":
      return 8;
    case "failed":
      return 4;
    case "on_hold":
      return 3;
    case "disputed":
      return 5;
    default:
      return 0;
  }
}

function buildTimeline(
  baseDate: string,
  status: SettlementStatus,
): SettlementTimelineStep[] {
  const progress = statusProgress(status);
  const failedAt = status === "failed" ? 4 : -1;
  const holdAt = status === "on_hold" ? 3 : -1;
  const disputedAt = status === "disputed" ? 5 : -1;

  return TIMELINE_STEP_ORDER.map((key, index) => {
    let stepStatus: SettlementTimelineStep["status"] = "pending";
    if (index < progress) stepStatus = "completed";
    else if (index === progress) stepStatus = "current";

    if (failedAt >= 0 && index > failedAt) stepStatus = "pending";
    if (holdAt >= 0 && index > holdAt && index <= holdAt + 1) {
      stepStatus = index === holdAt + 1 ? "current" : "pending";
    }
    if (disputedAt >= 0 && index === disputedAt) stepStatus = "current";

    return {
      key,
      label: TIMELINE_STEP_LABELS[key],
      timestamp: index <= progress ? addDays(baseDate, index + 1) : undefined,
      status: stepStatus,
    };
  });
}

function buildPaymentDetails(
  status: SettlementStatus,
  settlementId: string,
  paymentDate: string | null,
): PaymentDetails {
  const bank = randomFrom(BANKS);
  const mode = randomFrom(PAYMENT_MODES);
  const hasTransfer = status === "settled" || status === "processing";

  return {
    utrNumber: hasTransfer
      ? `${bank.slice(0, 4).toUpperCase()}${padRef(
          parseInt(settlementId.replace(/\D/g, ""), 10) || 9921,
        )}${Math.floor(Math.random() * 900 + 100)}`
      : undefined,
    transferDate: paymentDate ?? undefined,
    paymentMode: mode,
    bankName: bank,
    maskedAccountNumber: `XXXX-${Math.floor(Math.random() * 9000 + 1000)}`,
    paymentReference: hasTransfer
      ? `PT-PAY-${settlementId.replace("S-", "")}`
      : undefined,
    status,
  };
}

function generateSettlement(index: number): Settlement {
  const num = 9900 + index;
  const settlementId = `S-${num}`;
  const orderNum = 8800 + index;
  const orderRef = `ORD-${orderNum}-X`;
  const invoiceId = `INV-${2023}${padRef(index + 1)}`;
  const product = randomFrom(PRODUCTS);
  const warehouse = randomFrom(WAREHOUSES);
  const buyerCompany = randomFrom(BUYERS);
  const status = STATUSES[index % STATUSES.length]!;
  const quantityMt = Math.round((Math.random() * 1500 + 200) * 100) / 100;
  const unitPrice = Math.round(Math.random() * 45000 + 55000);
  const invoiceAmount = Math.round(quantityMt * unitPrice);

  const gstReversal = Math.round(invoiceAmount * 0.035);
  const inputTaxCredit = Math.round(invoiceAmount * 0.012);
  const platformCharges = Math.round(invoiceAmount * 0.003);
  const otherAdjustments =
    status === "disputed" ? Math.round(invoiceAmount * 0.008) : 0;

  const audit = computeSettlementAudit({
    grossInvoiceValue: invoiceAmount,
    commissionRate: 5.5,
    tdsRate: 1,
    gstReversal,
    inputTaxCredit,
    platformCharges,
    otherAdjustments,
  });

  const createdAt = addDays("2023-09-01T00:00:00.000Z", index * 2);
  const timeline = buildTimeline(createdAt, status);

  const isSettled = status === "settled";
  const isProcessing = status === "processing";
  const paymentDate = isSettled
    ? addDays(createdAt, 12 + (index % 5))
    : isProcessing
      ? null
      : null;
  const estimatedPaymentDate =
    !isSettled && !isProcessing
      ? addDays(createdAt, 18 + (index % 7))
      : isProcessing
        ? addDays(createdAt, 16)
        : undefined;

  return {
    id: `settlement-${num}`,
    settlementId,
    orderRef,
    invoiceId,
    buyerCompany,
    product: product.name,
    material: product.material,
    warehouse,
    quantityMt,
    invoiceAmount,
    netSettlement: audit.netSettlement,
    paymentDate,
    estimatedPaymentDate,
    status,
    timeline,
    audit,
    paymentDetails: buildPaymentDetails(status, settlementId, paymentDate),
    createdAt,
  };
}

export const settlementsMock: Settlement[] = Array.from(
  { length: 60 },
  (_, i) => generateSettlement(i + 1),
);

export function computeSettlementSummary(
  settlements: Settlement[],
): SettlementSummary {
  return settlements.reduce<SettlementSummary>(
    (acc, s) => {
      acc.grossRevenue += s.invoiceAmount;
      acc.commissionDeducted += s.audit.commissionAmount;

      if (s.status === "settled") {
        acc.settledAmount += s.netSettlement;
      } else if (
        s.status === "pending" ||
        s.status === "processing" ||
        s.status === "on_hold" ||
        s.status === "disputed"
      ) {
        acc.pendingSettlement += s.netSettlement;
      }

      return acc;
    },
    {
      grossRevenue: 0,
      pendingSettlement: 0,
      settledAmount: 0,
      commissionDeducted: 0,
    },
  );
}

export const settlementsSummaryMock = computeSettlementSummary(settlementsMock);

export function getSettlementById(id: string): Settlement | undefined {
  return settlementsMock.find((s) => s.id === id || s.settlementId === id);
}
