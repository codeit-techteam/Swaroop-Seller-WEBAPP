import type {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentDetails,
  PaymentTerm,
  SettlementStatus,
  TimelineStep,
  TrackingEvent,
  WarehouseCode,
} from "@/types/orders";
import { PAYMENT_TERM_LABELS } from "@/types/orders";

const PRODUCTS = [
  {
    name: "HDPE PE100 Pipe Grade",
    grade: "HDPE PE100",
    category: "HDPE",
    density: "0.960 g/cm³",
    mfi: "0.25 g/10min",
    application: "Pipe Extrusion",
    packaging: "Jumbo Bags",
  },
  {
    name: "LLDPE Film Grade",
    grade: "LLDPE F18",
    category: "LLDPE",
    density: "0.918 g/cm³",
    mfi: "1.0 g/10min",
    application: "Blown Film",
    packaging: "25kg Bags",
  },
  {
    name: "PVC Resin Suspension",
    grade: "PVC S-67",
    category: "PVC",
    density: "0.55 g/cm³",
    mfi: "N/A",
    application: "Pipe & Profiles",
    packaging: "Jumbo Bags",
  },
  {
    name: "Polypropylene Homopolymer (PP H110MA)",
    grade: "PP H110MA",
    category: "PP",
    density: "0.90 g/cm³",
    mfi: "11.0 g/10min",
    application: "Injection Molding",
    packaging: "Jumbo Bags",
  },
  {
    name: "ABS Injection Grade",
    grade: "ABS HI-121",
    category: "ABS",
    density: "1.04 g/cm³",
    mfi: "22 g/10min",
    application: "Injection Molding",
    packaging: "25kg Bags",
  },
] as const;

const WAREHOUSES: { code: WarehouseCode; label: string }[] = [
  { code: "Hazira", label: "Hazira Plant" },
  { code: "Mundra", label: "Mundra Terminal 3" },
  { code: "JNPT", label: "JNPT CFS Yard" },
  { code: "Dahej", label: "Dahej Chemical Hub" },
  { code: "Kandla", label: "Kandla Port Warehouse" },
];

const BUYERS = [
  "Apex Polymers Pvt Ltd",
  "Nova Plastics India",
  "Summit Petrochem",
  "Orion Packaging Co",
  "Vertex Materials Ltd",
  "Horizon Resins",
  "Delta Compounders",
  "Prime Extrusions",
  "Atlas Pipe Industries",
  "Quantum Films Pvt Ltd",
];

const CARRIERS = [
  "VRL Logistics Ltd.",
  "TCI Freight",
  "SafeExpress Carriers",
  "Gati Bulk Movers",
  "Om Logistics",
];

const PAYMENT_TERMS: PaymentTerm[] = [
  "advance",
  "credit_15",
  "credit_30",
  "on_delivery",
];

const STATUSES: OrderStatus[] = [
  "new",
  "new",
  "new",
  "accepted",
  "accepted",
  "processing",
  "processing",
  "processing",
  "dispatch_ready",
  "dispatch_ready",
  "in_transit",
  "in_transit",
  "delivered",
  "delivered",
  "delayed",
  "cancelled",
];

const INSTRUCTIONS = [
  "Special handling for polymer granules, avoid moisture exposure. Use desiccants in transit.",
  "Keep bags sealed until destination. Stack max 3 high. Avoid direct sunlight.",
  "Hazardous classification NA. Ensure clean dry truck bed before loading.",
  "Temperature sensitive — avoid loading during peak afternoon heat.",
  "Priority dispatch. Coordinate with warehouse lead before gate entry.",
];

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function isoDaysAgo(days: number, hour = 10, minute = 30): string {
  const d = new Date(2023, 9, 24, hour, minute, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildDocuments(
  status: OrderStatus,
  invoiceNumber: string,
): OrderDocument[] {
  const invoiceReady = status !== "new" && status !== "cancelled";
  const loadingReady = [
    "dispatch_ready",
    "in_transit",
    "delivered",
    "delayed",
  ].includes(status);
  const ewayReady = ["in_transit", "delivered", "delayed"].includes(status);

  return [
    {
      id: `doc-inv-${invoiceNumber}`,
      type: "invoice",
      name: `Invoice #${invoiceNumber}`,
      number: invoiceNumber,
      available: invoiceReady,
      sizeLabel: "245 KB",
      mimeType: "application/pdf",
    },
    {
      id: `doc-ls-${invoiceNumber}`,
      type: "loading_slip",
      name: "Loading Slip",
      available: loadingReady,
      sizeLabel: "128 KB",
      mimeType: "application/pdf",
    },
    {
      id: `doc-ew-${invoiceNumber}`,
      type: "eway_bill",
      name: "E-Way Bill",
      available: ewayReady,
      sizeLabel: "96 KB",
      mimeType: "application/pdf",
    },
  ];
}

function listTimeline(status: OrderStatus, createdAt: string): TimelineStep[] {
  const steps: { key: string; title: string }[] = [
    { key: "confirmed", title: "Order Confirmed" },
    { key: "qc", title: "Quality Check & Lab Testing" },
    { key: "dispatch_pending", title: "Dispatch Pending" },
    { key: "in_transit", title: "In Transit" },
    { key: "delivered", title: "Delivered" },
  ];

  const currentIndex: Record<OrderStatus, number> = {
    new: 0,
    accepted: 0,
    processing: 1,
    dispatch_ready: 2,
    in_transit: 3,
    delivered: 4,
    delayed: 3,
    cancelled: 0,
  };

  const idx = currentIndex[status];

  return steps.map((step, i) => {
    let stepStatus: TimelineStep["status"] = "pending";
    if (status === "cancelled") {
      stepStatus = i === 0 ? "completed" : "pending";
    } else if (i < idx) {
      stepStatus = "completed";
    } else if (i === idx) {
      stepStatus = status === "delivered" ? "completed" : "current";
    }

    const descriptions: Record<string, string> = {
      confirmed:
        stepStatus === "completed"
          ? new Date(createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Awaiting confirmation",
      qc:
        stepStatus === "current"
          ? "In Progress - Batch #" + (700 + i * 12)
          : stepStatus === "completed"
            ? "QC Passed"
            : "Awaiting action",
      dispatch_pending:
        stepStatus === "current"
          ? "Est. " +
            new Date(createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
          : stepStatus === "completed"
            ? "Dispatch scheduled"
            : "Awaiting action",
      in_transit:
        stepStatus === "current"
          ? "Carrier Assignment Pending"
          : stepStatus === "completed"
            ? "En route"
            : "Awaiting action",
      delivered:
        stepStatus === "completed"
          ? "Delivered successfully"
          : "Awaiting action",
    };

    return {
      id: `tl-${step.key}`,
      key: step.key,
      title: step.title,
      description: descriptions[step.key] ?? "",
      timestamp: i <= idx && status !== "cancelled" ? createdAt : undefined,
      status: stepStatus,
    };
  });
}

function detailTimeline(
  status: OrderStatus,
  createdAt: string,
): TimelineStep[] {
  const steps = [
    { key: "created", title: "Order Created" },
    { key: "seller_approved", title: "Seller Approval" },
    { key: "payment", title: "Payment Verified" },
    { key: "dispatch_ready", title: "Dispatch Ready" },
    { key: "loading", title: "Loading" },
    { key: "in_transit", title: "In Transit" },
    { key: "delivered", title: "Delivered" },
  ];

  const currentIndex: Record<OrderStatus, number> = {
    new: 1,
    accepted: 2,
    processing: 3,
    dispatch_ready: 3,
    in_transit: 5,
    delivered: 6,
    delayed: 5,
    cancelled: 1,
  };

  const idx = currentIndex[status];

  return steps.map((step, i) => {
    let stepStatus: TimelineStep["status"] = "pending";
    if (status === "cancelled") {
      stepStatus = i === 0 ? "completed" : i === 1 ? "current" : "pending";
    } else if (i < idx) {
      stepStatus = "completed";
    } else if (i === idx) {
      stepStatus = status === "delivered" ? "completed" : "current";
    }

    const awaiting =
      step.key === "seller_approved" && status === "new"
        ? "Pending Seller Review"
        : stepStatus === "completed"
          ? new Date(createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Awaiting action";

    return {
      id: `dtl-${step.key}`,
      key: step.key,
      title: step.title,
      description: awaiting,
      timestamp: i <= idx ? createdAt : undefined,
      status: stepStatus,
    };
  });
}

function settlementFor(status: OrderStatus): SettlementStatus {
  if (status === "delivered") return "settlement_completed";
  if (status === "in_transit" || status === "delayed")
    return "settlement_pending";
  if (status === "cancelled" || status === "new") return "settlement_pending";
  return "funds_secured";
}

function paymentFor(
  status: OrderStatus,
  term: PaymentTerm,
  amountDue: number,
  index: number,
): PaymentDetails {
  if (term === "on_delivery") {
    if (status === "delivered") {
      return {
        status: "collected",
        amountDue,
        amountPaid: amountDue,
        paidAt: isoDaysAgo(Math.max(0, (index % 28) - 7)),
        verifiedAt: isoDaysAgo(Math.max(0, (index % 28) - 7)),
        verifiedBy: "Ops Desk",
        notes: "Collected from consignee on delivery",
      };
    }
    return {
      status: "collect_on_delivery",
      amountDue,
      amountPaid: 0,
      notes: "Payment due at delivery",
    };
  }

  if (status === "new") {
    return {
      status: "awaiting_payment",
      amountDue,
      amountPaid: 0,
      notes:
        term === "advance"
          ? "Awaiting 100% advance after PI acceptance"
          : "Credit terms — PI pending acceptance",
    };
  }

  if (status === "accepted" && term === "advance" && index % 3 === 0) {
    return {
      status: "proof_submitted",
      amountDue,
      amountPaid: amountDue,
      utr: `UTR${240000000 + index}`,
      paidAt: isoDaysAgo(Math.max(0, (index % 28) - 1)),
      proofFileName: `payment-proof-${index}.pdf`,
      notes: "Buyer submitted NEFT proof — pending verification",
    };
  }

  if (status === "accepted" && term === "advance") {
    return {
      status: "awaiting_payment",
      amountDue,
      amountPaid: 0,
      notes: "PI generated — awaiting buyer payment",
    };
  }

  if (status === "cancelled") {
    return {
      status: "awaiting_payment",
      amountDue,
      amountPaid: 0,
    };
  }

  return {
    status: "verified",
    amountDue,
    amountPaid: term === "advance" ? amountDue : Math.round(amountDue * 0.3),
    utr: `UTR${250000000 + index}`,
    paidAt: isoDaysAgo(Math.max(0, (index % 28) - 2)),
    verifiedAt: isoDaysAgo(Math.max(0, (index % 28) - 2)),
    verifiedBy: "Finance Desk",
    proofFileName: `neft-receipt-${index}.pdf`,
    notes:
      term === "advance"
        ? "100% advance verified in escrow"
        : "Credit approved — partial advance received",
  };
}

function trackingFor(
  status: OrderStatus,
  warehouseLabel: string,
  createdAt: string,
  index: number,
): TrackingEvent[] {
  if (!["in_transit", "delivered", "delayed"].includes(status)) {
    if (status === "dispatch_ready") {
      return [
        {
          id: `trk-${index}-gate`,
          label: "Vehicle assigned — awaiting gate-out",
          location: warehouseLabel,
          timestamp: createdAt,
          status: "current",
        },
      ];
    }
    return [];
  }

  const events: TrackingEvent[] = [
    {
      id: `trk-${index}-1`,
      label: "Dispatched from warehouse",
      location: warehouseLabel,
      timestamp: isoDaysAgo(Math.max(0, (index % 28) - 4), 9, 30),
      status: "completed",
    },
    {
      id: `trk-${index}-2`,
      label: "In transit — highway checkpoint",
      location: index % 2 === 0 ? "Vadodara Bypass" : "Ahmedabad Ring Road",
      timestamp: isoDaysAgo(Math.max(0, (index % 28) - 5), 14, 10),
      status: status === "delayed" ? "current" : "completed",
      note: status === "delayed" ? "Delay due to weather hold" : undefined,
    },
    {
      id: `trk-${index}-3`,
      label:
        status === "delivered"
          ? "Arrived at buyer premises"
          : "En route to destination",
      location:
        status === "delivered"
          ? "Buyer Gate — Navi Mumbai"
          : "Approaching destination city",
      timestamp: isoDaysAgo(Math.max(0, (index % 28) - 6), 11, 0),
      status: status === "delivered" ? "completed" : "current",
    },
  ];

  if (status === "delivered") {
    events.push({
      id: `trk-${index}-4`,
      label: "Delivered — POD captured",
      location: "Buyer Warehouse",
      timestamp: isoDaysAgo(Math.max(0, (index % 28) - 7), 16, 20),
      status: "completed",
      note: "OTP verified with consignee",
    });
  }

  return events;
}

function createOrder(index: number): Order {
  const product = PRODUCTS[index % PRODUCTS.length]!;
  const warehouse = WAREHOUSES[index % WAREHOUSES.length]!;
  const paymentTerm = PAYMENT_TERMS[index % PAYMENT_TERMS.length]!;
  const status = STATUSES[index % STATUSES.length]!;
  const buyer = BUYERS[index % BUYERS.length]!;
  const qty = 25 + (index % 12) * 15 + (index % 3) * 5;
  const unitPrice = 72000 + (index % 8) * 4200;
  const subtotal = qty * unitPrice;
  const gstRate = 18;
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const freight = 8000 + (index % 5) * 1450;
  const insurance = Math.round(subtotal * 0.002);
  const createdAt = isoDaysAgo(index % 28, 10 + (index % 8), 15 + (index % 40));
  const dispatchAt = isoDaysAgo(Math.max(0, (index % 28) - 3), 9, 0);
  const etaAt = isoDaysAgo(Math.max(0, (index % 28) - 6), 18, 0);
  const invoiceNumber = `INV-${900 + index}`;
  const orderNumber = `ORD-2023-${String.fromCharCode(65 + (index % 26))}${pad(100 + index, 3)}`;

  const hasTransport = [
    "dispatch_ready",
    "in_transit",
    "delivered",
    "delayed",
  ].includes(status);
  const totalLanded = subtotal + gstAmount + freight + insurance;
  const transportAssigned =
    hasTransport && (status !== "dispatch_ready" || index % 2 === 1);

  return {
    id: `ord-${pad(index + 1, 3)}`,
    orderNumber,
    buyerCompany: buyer,
    customerRequestId: `PR-2023-${pad(200 + index, 3)}`,
    productName: product.name,
    productGrade: product.grade,
    materialCategory: product.category,
    quantityMt: qty,
    unitPrice,
    packaging: product.packaging,
    warehouse: warehouse.code,
    warehouseLabel: warehouse.label,
    dispatchDate: dispatchAt,
    eta: etaAt,
    paymentTerm,
    paymentLabel: PAYMENT_TERM_LABELS[paymentTerm],
    payment: paymentFor(status, paymentTerm, totalLanded, index),
    status,
    settlementStatus: settlementFor(status),
    gradeSpecs: {
      density: product.density,
      mfi: product.mfi,
      application: product.application,
      coaUrl: "#coa",
    },
    dispatchInstructions: INSTRUCTIONS[index % INSTRUCTIONS.length]!,
    documents: buildDocuments(status, invoiceNumber),
    transport: hasTransport
      ? {
          carrier: CARRIERS[index % CARRIERS.length]!,
          vehicleNumber: transportAssigned
            ? `GJ-${pad(1 + (index % 30))}-AB-${1000 + index}`
            : "Waiting...",
          driver: transportAssigned
            ? `Driver ${String.fromCharCode(65 + (index % 26))}`
            : "Pending assignment",
          driverPhone: transportAssigned
            ? `98${String(10000000 + index).slice(0, 8)}`
            : undefined,
          eta: formatDateLabel(etaAt),
          currentLocation: transportAssigned
            ? status === "delivered"
              ? "Buyer Warehouse"
              : status === "in_transit" || status === "delayed"
                ? index % 2 === 0
                  ? "Vadodara Bypass"
                  : "Ahmedabad Ring Road"
                : warehouse.label
            : undefined,
        }
      : null,
    trackingEvents: trackingFor(status, warehouse.label, createdAt, index),
    proofOfDelivery:
      status === "delivered"
        ? {
            receiverName: `Store Incharge ${String.fromCharCode(65 + (index % 26))}`,
            receivedAt: isoDaysAgo(Math.max(0, (index % 28) - 7), 16, 20),
            otpVerified: true,
            notes: "Material received in good condition",
            fileName: `pod-${orderNumber}.pdf`,
          }
        : null,
    timeline: listTimeline(status, createdAt),
    detailTimeline: detailTimeline(status, createdAt),
    financials: {
      subtotal,
      gstRate,
      gstAmount,
      freight,
      insurance,
      totalLandedCost: totalLanded,
    },
    paymentRisk: {
      creditStatus: "KYC Verified & Pre-Approved",
      tradeInsurance: "Covered up to ₹2 Cr",
      paymentTermsLabel: PAYMENT_TERM_LABELS[paymentTerm],
      incoterms: `Ex-Works (${warehouse.label})`,
    },
    billing: {
      registration: "Maharashtra, India",
      billingAddress:
        "MNDC, Building 4, North Block, Reliance Corporate Park, Thane-Belapur Road, Ghansoli, Navi Mumbai, Maharashtra 400701",
    },
    submittedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
    invoiceNumber:
      status === "new" || status === "cancelled" ? undefined : invoiceNumber,
    pendingInvoice:
      status === "new" || status === "accepted" || status === "processing",
    processingDays: 2 + (index % 6) + (index % 3) * 0.2,
    acceptedAt:
      status !== "new" && status !== "cancelled" ? createdAt : undefined,
  };
}

export const ordersMock: Order[] = Array.from({ length: 50 }, (_, i) =>
  createOrder(i),
);

export function computeOrderSummary(orders: Order[]) {
  const volume = orders.reduce((sum, o) => sum + o.quantityMt, 0);
  const pendingInvoices = orders.filter((o) => o.pendingInvoice).length;
  const withDays = orders.filter((o) => o.processingDays != null);
  const avg =
    withDays.length === 0
      ? 0
      : withDays.reduce((s, o) => s + (o.processingDays ?? 0), 0) /
        withDays.length;
  const readyForDispatch = orders.filter(
    (o) => o.status === "dispatch_ready",
  ).length;

  return {
    totalVolumeMt: volume,
    pendingInvoices,
    avgProcessingDays: Math.round(avg * 10) / 10,
    readyForDispatch,
  };
}
