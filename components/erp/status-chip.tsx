"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusChipVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        sourced: "border-emerald-200 bg-emerald-50 text-emerald-700",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        live: "border-blue-200 bg-blue-50 text-blue-700",
        closed: "border-red-200 bg-red-50 text-red-700",
        in_stock: "border-blue-300 bg-white text-blue-700",
        low_stock: "border-red-300 bg-white text-red-600",
        out_of_stock: "border-slate-300 bg-white text-slate-500",
        urgent: "border-red-200 bg-red-50 text-red-600",
        default: "border-slate-200 bg-slate-50 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type StatusChipVariant = NonNullable<
  VariantProps<typeof statusChipVariants>["variant"]
>;

interface StatusChipProps extends VariantProps<typeof statusChipVariants> {
  label: string;
  className?: string;
}

export function StatusChip({ label, variant, className }: StatusChipProps) {
  return (
    <span className={cn(statusChipVariants({ variant }), className)}>
      {label}
    </span>
  );
}

export function transactionStatusVariant(status: string): StatusChipVariant {
  switch (status) {
    case "SOURCED":
      return "sourced";
    case "PENDING":
      return "pending";
    case "LIVE":
      return "live";
    case "CLOSED":
      return "closed";
    default:
      return "default";
  }
}

export function inventoryStatusVariant(status: string): StatusChipVariant {
  switch (status) {
    case "IN_STOCK":
      return "in_stock";
    case "LOW_STOCK":
      return "low_stock";
    case "OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "default";
  }
}

export function inventoryStatusLabel(status: string): string {
  switch (status) {
    case "IN_STOCK":
      return "IN STOCK";
    case "LOW_STOCK":
      return "LOW STOCK";
    case "OUT_OF_STOCK":
      return "OUT OF STOCK";
    default:
      return status;
  }
}
