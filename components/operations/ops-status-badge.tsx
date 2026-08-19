"use client";

import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  SOURCED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  LIVE: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DISPATCHED: "border-sky-200 bg-sky-50 text-sky-700",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-600",
  NEGOTIATION: "border-violet-200 bg-violet-50 text-violet-700",
  NEW: "border-blue-200 bg-blue-50 text-blue-700",
  SELLER_SOURCING: "border-sky-200 bg-sky-50 text-sky-700",
  QUOTATION_RECEIVED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  APPROVAL_PENDING: "border-orange-200 bg-orange-50 text-orange-700",
  CONVERTED_TO_PO: "border-blue-200 bg-blue-50 text-blue-700",
  PO_DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  SENT_TO_SELLER: "border-blue-200 bg-blue-50 text-blue-700",
  SELLER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PARTIALLY_CONFIRMED: "border-amber-200 bg-amber-50 text-amber-700",
  READY_FOR_DISPATCH: "border-emerald-200 bg-emerald-50 text-emerald-700",
  IN_TRANSIT: "border-sky-200 bg-sky-50 text-sky-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RFQ_SENT: "border-blue-200 bg-blue-50 text-blue-700",
  QUOTE_PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  SUBMITTED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  NONE: "border-slate-200 bg-slate-50 text-slate-600",
  SELECTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PO_ISSUED: "border-blue-200 bg-blue-50 text-blue-700",
  VALID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHANGE_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  CUSTOMER_PR: "border-slate-200 bg-slate-50 text-slate-600",
  RFQ: "border-blue-200 bg-blue-50 text-blue-700",
  QUOTATION: "border-violet-200 bg-violet-50 text-violet-700",
  COMMERCIAL: "border-slate-200 bg-slate-50 text-slate-600",
  PO: "border-blue-200 bg-blue-50 text-blue-700",
  SHIPPING: "border-sky-200 bg-sky-50 text-sky-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  PENDING_APPROVAL: "border-orange-200 bg-orange-50 text-orange-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  COMPLETED: "border-slate-200 bg-slate-100 text-slate-700",
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  COUNTERED: "border-violet-200 bg-violet-50 text-violet-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PO_CREATED: "border-blue-200 bg-blue-50 text-blue-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-500",
  NORMAL: "border-slate-200 bg-slate-50 text-slate-600",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  URGENT: "border-red-200 bg-red-50 text-red-700",
  SETTLED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  OPEN: "border-blue-200 bg-blue-50 text-blue-700",
  PARTIAL: "border-amber-200 bg-amber-50 text-amber-700",
  COLLECTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INVITED: "border-blue-200 bg-blue-50 text-blue-700",
  SUSPENDED: "border-red-200 bg-red-50 text-red-700",
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  EXPIRED: "border-red-200 bg-red-50 text-red-700",
  ONBOARDING: "border-blue-200 bg-blue-50 text-blue-700",
  HOLD: "border-amber-200 bg-amber-50 text-amber-700",
  INACTIVE: "border-slate-200 bg-slate-50 text-slate-600",
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  GENERATING: "border-blue-200 bg-blue-50 text-blue-700",
  AWAITING_EVIDENCE: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RELEASED: "border-slate-200 bg-slate-50 text-slate-600",
  CONSUMED: "border-blue-200 bg-blue-50 text-blue-700",
  EXHAUSTED: "border-red-200 bg-red-50 text-red-700",
};

export function OpsStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        MAP[status] ?? "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
