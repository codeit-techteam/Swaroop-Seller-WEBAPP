"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { DispatchStatus } from "@/types/dispatch";
import { DISPATCH_STATUS_LABELS } from "@/types/dispatch";

const variants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      status: {
        ready_to_dispatch: "border-slate-200 bg-slate-50 text-slate-700",
        vehicle_assigned: "border-amber-200/80 bg-amber-50 text-amber-700",
        loading_in_progress: "border-teal-200/80 bg-teal-50 text-teal-700",
        ready_for_release: "border-blue-200/80 bg-blue-50 text-blue-700",
        dispatched: "border-indigo-200/80 bg-indigo-50 text-indigo-700",
        delivered: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
        delayed: "border-red-200/80 bg-red-50 text-red-600",
      },
    },
    defaultVariants: {
      status: "ready_to_dispatch",
    },
  },
);

const dotColors: Record<DispatchStatus, string> = {
  ready_to_dispatch: "bg-slate-400",
  vehicle_assigned: "bg-amber-500",
  loading_in_progress: "bg-teal-500",
  ready_for_release: "bg-blue-500",
  dispatched: "bg-indigo-500",
  delivered: "bg-emerald-500",
  delayed: "bg-red-500",
};

interface StatusBadgeProps {
  status: DispatchStatus;
  isDelayed?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  isDelayed,
  className,
}: StatusBadgeProps) {
  const displayStatus =
    isDelayed && status !== "delivered" ? "delayed" : status;
  return (
    <span className={cn(variants({ status: displayStatus }), className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotColors[displayStatus],
        )}
      />
      {DISPATCH_STATUS_LABELS[displayStatus]}
    </span>
  );
}

const materialColors = [
  "border-teal-200/70 bg-teal-50 text-teal-800",
  "border-violet-200/70 bg-violet-50 text-violet-800",
  "border-orange-200/70 bg-orange-50 text-orange-800",
  "border-sky-200/70 bg-sky-50 text-sky-800",
  "border-rose-200/70 bg-rose-50 text-rose-800",
  "border-lime-200/70 bg-lime-50 text-lime-800",
];

export function MaterialBadge({
  material,
  className,
}: {
  material: string;
  className?: string;
}) {
  const hash = material
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const color = materialColors[hash % materialColors.length];
  return (
    <span
      className={cn(
        "inline-flex max-w-[160px] truncate rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        color,
        className,
      )}
      title={material}
    >
      {material}
    </span>
  );
}
