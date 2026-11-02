import { cn } from "@/lib/utils";
import type { GradeRequestStatus } from "@/services/grade-requests";

const TONE: Record<GradeRequestStatus, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-800",
  INFO_REQUIRED: "bg-orange-50 text-orange-800",
  GRADE_IDENTIFIED: "bg-sky-50 text-sky-700",
  QUOTATION_AVAILABLE: "bg-emerald-50 text-emerald-700",
  CONVERTED_TO_PR: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

/**
 * Sellers never raise a purchase request from a grade request, so the
 * customer-oriented "Converted to Purchase Request" reads as "Completed".
 */
export function sellerStatusLabel(
  status: GradeRequestStatus,
  label: string,
): string {
  return status === "CONVERTED_TO_PR" ? "Completed" : label;
}

export function GradeRequestStatusBadge({
  status,
  label,
}: {
  status: GradeRequestStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-medium",
        TONE[status] ?? TONE.SUBMITTED,
      )}
    >
      {sellerStatusLabel(status, label)}
    </span>
  );
}
