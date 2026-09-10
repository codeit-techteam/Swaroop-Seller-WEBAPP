import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  success: "bg-emerald-50 text-emerald-700",
  verified: "bg-emerald-50 text-emerald-700",
  received: "bg-emerald-50 text-emerald-700",
  settled: "bg-emerald-50 text-emerald-700",
  SETTLED: "bg-emerald-50 text-emerald-700",
  delivered: "bg-emerald-50 text-emerald-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  accepted: "bg-emerald-50 text-emerald-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  paused: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  PENDING: "bg-amber-50 text-amber-700",
  new: "bg-blue-50 text-[#1B6EF3]",
  under_review: "bg-violet-50 text-violet-700",
  UNDER_REVIEW: "bg-violet-50 text-violet-700",
  processing: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  scheduled: "bg-amber-50 text-amber-700",
  loading: "bg-amber-50 text-amber-700",
  LOADING: "bg-amber-50 text-amber-700",
  confirmation: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-[#1B6EF3]",
  CONFIRMED: "bg-blue-50 text-[#1B6EF3]",
  ready: "bg-blue-50 text-[#1B6EF3]",
  ready_for_dispatch: "bg-blue-50 text-[#1B6EF3]",
  READY_FOR_DISPATCH: "bg-blue-50 text-[#1B6EF3]",
  in_transit: "bg-blue-50 text-[#1B6EF3]",
  IN_TRANSIT: "bg-blue-50 text-[#1B6EF3]",
  dispatched: "bg-blue-50 text-[#1B6EF3]",
  DISPATCHED: "bg-blue-50 text-[#1B6EF3]",
  verification_pending: "bg-violet-50 text-violet-700",
  pending_verification: "bg-violet-50 text-violet-700",
  expiring_soon: "bg-amber-50 text-amber-700",
  expired: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
  REJECTED: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
  failed: "bg-red-50 text-red-700",
  on_hold: "bg-red-50 text-red-700",
  "ON HOLD": "bg-red-50 text-red-700",
  counter_sent: "bg-blue-50 text-[#1B6EF3]",
  COUNTER_OFFER: "bg-violet-50 text-violet-700",
  COUNTERED: "bg-violet-50 text-violet-700",
  AWAITING_RESPONSE: "bg-amber-50 text-amber-700",
  BOOKED: "bg-blue-50 text-[#1B6EF3]",
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  FULL: "bg-red-50 text-red-700",
  BLOCKED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  SETTLEMENT_PENDING: "bg-amber-50 text-amber-700",
  NOT_STARTED: "bg-slate-100 text-slate-500",
  OVERDUE: "bg-red-50 text-red-700",
  MISSING: "bg-red-50 text-red-700",
  CRITICAL: "bg-red-50 text-red-700",
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-blue-50 text-[#1B6EF3]",
  LOW: "bg-slate-100 text-slate-600",
  PR: "bg-blue-50 text-[#1B6EF3]",
  COMMERCIAL_REVIEW: "bg-violet-50 text-violet-700",
  PRICE_REVISION: "bg-amber-50 text-amber-700",
  PO: "bg-indigo-50 text-indigo-700",
  PAYMENT: "bg-amber-50 text-amber-700",
  DISPATCH: "bg-sky-50 text-sky-700",
  SHIPMENT: "bg-blue-50 text-[#1B6EF3]",
  SETTLEMENT: "bg-emerald-50 text-emerald-700",
  ARRIVED: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-100 text-slate-500",
  INACTIVE: "bg-slate-100 text-slate-500",
  none: "bg-slate-100 text-slate-500",
  IN_STOCK: "bg-emerald-50 text-emerald-700",
  LOW_STOCK: "bg-amber-50 text-amber-700",
  OUT_OF_STOCK: "bg-red-50 text-red-700",
};

function labelize(value: string) {
  if (value === "counter_sent" || value === "COUNTER_OFFER") return "Counter Offer";
  if (value === "new") return "new";
  if (value === "under_review") return "under review";
  if (value === "IN_STOCK") return "In Stock";
  if (value === "LOW_STOCK") return "Low Stock";
  if (value === "OUT_OF_STOCK") return "Out of Stock";
  if (value === "PR") return "PR";
  if (value === "PO") return "PO";
  return value.replace(/_/g, " ");
}

export function SellerStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[status] ?? "bg-slate-100 text-slate-600",
        className,
      )}
    >
      {labelize(status)}
    </span>
  );
}
