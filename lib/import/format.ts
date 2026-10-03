import { isAxiosError } from "axios";

import type {
  ImportListing,
  ImportListingStatus,
  ImportQuantityUnit,
} from "@/types/import";

const LABELS: Record<string, string> = {
  // Listing status
  DRAFT: "Draft",
  PUBLISHED: "Published",
  MATCHING: "Matching",
  OFFER_RECEIVED: "Offer received",
  NEGOTIATION: "Negotiation",
  MATCHED: "Matched",
  DEAL_CONFIRMED: "Deal confirmed",
  PARTIALLY_FULFILLED: "Partially fulfilled",
  FULFILLED: "Fulfilled",
  PAUSED: "Paused",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  // Negotiation / deal status
  OPEN: "Open",
  AGREED: "Agreed",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  PENDING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  // Units
  MT: "MT",
  KG: "KG",
  CONTAINER: "Container",
  OTHER: "Other",
  // Price type
  FIXED: "Fixed",
  NEGOTIABLE: "Negotiable",
  INDICATIVE: "Indicative",
  FORMULA_BASED: "Formula based",
  INDEX_LINKED: "Index linked",
  // GST
  GST_EXTRA: "GST extra",
  GST_INCLUDED: "GST included",
  GST_APPLICABLE: "GST applicable",
  GST_EXEMPT_NIL: "GST exempt / nil",
  // Shipment
  ALLOWED: "Allowed",
  NOT_ALLOWED: "Not allowed",
  FCL: "FCL",
  LCL: "LCL",
  BULK: "Bulk",
  FT_20: "20 ft",
  FT_40: "40 ft",
  // Inspection
  NO_INSPECTION: "No inspection",
  SELLER_INSPECTION: "Seller inspection",
  SGS: "SGS",
  BUREAU_VERITAS: "Bureau Veritas",
  OTHER_THIRD_PARTY: "Other third party",
  BUYER_INSPECTION: "Buyer inspection",
  // Stock
  READY_STOCK: "Ready stock",
  PRODUCTION: "Production",
  FUTURE_SHIPMENT: "Future shipment",
  // Negotiation events
  OPENED: "Offer sent",
  COUNTER: "Counteroffer",
  ACCEPTED: "Accepted",
  // Match criteria
  PRODUCT: "Product",
  GRADE: "Grade",
  BRAND: "Brand",
  ORIGIN: "Origin",
  QUANTITY: "Quantity",
  MOQ: "MOQ",
  PRICE: "Price",
  CURRENCY: "Currency",
  INCOTERM: "Incoterm",
  POL: "Port of loading",
  POD: "Port of discharge",
  PAYMENT_TERMS: "Payment terms",
  SHIPMENT_WINDOW: "Shipment window",
  QUALITY: "Quality & documents",
  // Shipment status
  BOOKED: "Shipment booked",
  SHIPPED: "Shipped / picked up",
  IN_TRANSIT: "In transit",
  ARRIVED: "Arrived at destination port",
  CUSTOMS_CLEARANCE: "Customs clearance",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  EXCEPTION: "Exception",
  // Shipment mode
  SEA: "Sea",
  AIR: "Air",
  ROAD: "Road",
  RAIL: "Rail",
  MULTIMODAL: "Multimodal",
  // Parties
  BUYER: "Buyer",
  SELLER: "Seller",
  ADMIN: "Swaroop team",
  SYSTEM: "System",
};

export function importLabel(value?: string | null): string {
  if (!value) return "—";
  return (
    LABELS[value] ??
    value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONES: Record<string, Tone> = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  MATCHING: "info",
  OFFER_RECEIVED: "warning",
  NEGOTIATION: "warning",
  MATCHED: "success",
  DEAL_CONFIRMED: "success",
  PARTIALLY_FULFILLED: "success",
  FULFILLED: "success",
  PAUSED: "neutral",
  EXPIRED: "danger",
  CANCELLED: "danger",
  OPEN: "warning",
  AGREED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
  PENDING_CONFIRMATION: "warning",
  CONFIRMED: "success",
  BOOKED: "info",
  SHIPPED: "info",
  IN_TRANSIT: "info",
  ARRIVED: "info",
  CUSTOMS_CLEARANCE: "warning",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  EXCEPTION: "danger",
};

export const toneFor = (status: string): Tone => TONES[status] ?? "neutral";

export const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
};

/** Formats a decimal string without float rounding (grouping only). */
export function formatDecimal(value?: string | null, maxFraction = 4): string {
  if (value === null || value === undefined || value === "") return "—";
  const [int = "", frac = ""] = value.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = frac.slice(0, maxFraction).replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

export function formatQty(
  value?: string | null,
  unit?: ImportQuantityUnit | null,
): string {
  if (!value) return "—";
  return `${formatDecimal(value, 3)} ${unit ? importLabel(unit) : ""}`.trim();
}

/** "USD 1,050.00 / MT" — currency is always explicit; never converted. */
export function formatPrice(
  value?: string | null,
  currencyCode?: string | null,
  unit?: ImportQuantityUnit | null,
): string {
  if (!value) return "—";
  const [int = "", frac = ""] = value.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const significant = frac.slice(0, 4).replace(/0+$/, "");
  const amount = `${grouped}.${significant.padEnd(2, "0")}`;
  const per = unit ? ` / ${importLabel(unit)}` : "";
  return `${currencyCode ?? ""} ${amount}${per}`.trim();
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: value.length === 10 ? "UTC" : undefined,
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRemaining(seconds: number | null): string {
  if (seconds === null) return "No expiry set";
  if (seconds <= 0) return "Expired";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${Math.max(1, m)}m left`;
}

export function listingTitle(l: ImportListing): string {
  const product = l.product.category?.name ?? "Product not set";
  const grade = l.product.grade?.name ?? l.product.customGradeName;
  return grade ? `${product} · ${grade}` : product;
}

export function portLabel(p?: { code: string; name: string } | null): string {
  return p ? `${p.name} (${p.code})` : "—";
}

export const OPEN_STATUSES: ImportListingStatus[] = [
  "PUBLISHED",
  "MATCHING",
  "OFFER_RECEIVED",
  "NEGOTIATION",
];

export type ImportFieldError = { field: string; code: string; message: string };

export type ImportApiError = {
  status: number | null;
  code: string;
  message: string;
  fields: ImportFieldError[];
};

/** Normalises Import (`{code,message,details}`) and validation-pipe errors. */
export function parseImportError(error: unknown): ImportApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = (error.response?.data ?? {}) as Record<string, unknown>;
    const details = Array.isArray(body.details)
      ? (body.details as ImportFieldError[]).filter(
          (d) => d && typeof d.field === "string",
        )
      : [];
    const rawMessage = body.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(". ")
      : typeof rawMessage === "string"
        ? rawMessage
        : status === null
          ? "Network error. Check your connection and try again."
          : "Something went wrong. Please try again.";
    return {
      status,
      code: typeof body.code === "string" ? body.code : `HTTP_${status ?? 0}`,
      message,
      fields: details,
    };
  }
  return {
    status: null,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Something went wrong.",
    fields: [],
  };
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export const DECIMAL_QTY = /^\d{1,15}(\.\d{1,3})?$/;
export const DECIMAL_PRICE = /^\d{1,14}(\.\d{1,4})?$/;

/** Quantity decimal string → integer thousandths, so sums never drift. */
export function qtyToMilli(value?: string | null): bigint {
  const match = /^(\d*)(?:\.(\d*))?$/.exec((value ?? "").trim());
  if (!match) return BigInt(0);
  const frac = (match[2] ?? "").padEnd(3, "0").slice(0, 3);
  return BigInt(`${match[1] || "0"}${frac}`);
}

export function milliToQty(value: bigint): string {
  const negative = value < BigInt(0);
  const digits = (negative ? -value : value).toString().padStart(4, "0");
  const frac = digits.slice(-3).replace(/0+$/, "");
  return `${negative ? "-" : ""}${digits.slice(0, -3)}${frac ? `.${frac}` : ""}`;
}

/** `<input type="datetime-local">` value in the browser's time zone. */
export function toLocalDateTimeInput(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
