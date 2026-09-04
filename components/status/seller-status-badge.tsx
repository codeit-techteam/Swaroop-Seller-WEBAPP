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
  draft: "bg-slate-100 text-slate-600",
  paused: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  PENDING: "bg-amber-50 text-amber-700",
  new: "bg-blue-50 text-[#1B6EF3]",
  under_review: "bg-violet-50 text-violet-700",
  processing: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  scheduled: "bg-amber-50 text-amber-700",
  loading: "bg-amber-50 text-amber-700",
  LOADING: "bg-amber-50 text-amber-700",
  confirmation: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-[#1B6EF3]",
  ready: "bg-blue-50 text-[#1B6EF3]",
  ready_for_dispatch: "bg-blue-50 text-[#1B6EF3]",
  in_transit: "bg-blue-50 text-[#1B6EF3]",
  IN_TRANSIT: "bg-blue-50 text-[#1B6EF3]",
  dispatched: "bg-blue-50 text-[#1B6EF3]",
  DISPATCHED: "bg-blue-50 text-[#1B6EF3]",
  verification_pending: "bg-violet-50 text-violet-700",
  pending_verification: "bg-violet-50 text-violet-700",
  expiring_soon: "bg-amber-50 text-amber-700",
  expired: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
  failed: "bg-red-50 text-red-700",
  on_hold: "bg-red-50 text-red-700",
  "ON HOLD": "bg-red-50 text-red-700",
  counter_sent: "bg-blue-50 text-[#1B6EF3]",
  inactive: "bg-slate-100 text-slate-500",
  INACTIVE: "bg-slate-100 text-slate-500",
  none: "bg-slate-100 text-slate-500",
};

function labelize(value: string) {
  if (value === "counter_sent") return "Counter Offer";
  if (value === "new") return "new";
  if (value === "under_review") return "under review";
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
