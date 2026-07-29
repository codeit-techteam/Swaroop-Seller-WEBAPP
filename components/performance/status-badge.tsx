"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/types/performance";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        optimal: "border-[#1B6EF3]/30 bg-[#E8F1FF] text-[#1B6EF3]",
        warning: "border-red-200 bg-red-50 text-red-600",
        critical: "border-red-300 bg-red-100 text-red-700",
        healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "optimal",
    },
  },
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: MetricStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant: status }), className)}>
      {status}
    </span>
  );
}

export function metricStatusLabel(status: MetricStatus): string {
  return status.toUpperCase();
}
