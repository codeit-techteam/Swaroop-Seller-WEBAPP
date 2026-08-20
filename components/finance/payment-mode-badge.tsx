"use client";

import { cn } from "@/lib/utils";
import {
  PAYMENT_MODE_LABELS,
  type PaymentMode,
} from "@/types/finance";

const MODE_STYLES: Record<PaymentMode, string> = {
  ADVANCE: "border-violet-200 bg-violet-50 text-violet-700",
  ON_LOADING: "border-sky-200 bg-sky-50 text-sky-700",
  ON_DELIVERY: "border-amber-200 bg-amber-50 text-amber-800",
  CREDIT: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

interface PaymentModeBadgeProps {
  mode: PaymentMode;
  creditDays?: number;
  className?: string;
}

export function PaymentModeBadge({
  mode,
  creditDays,
  className,
}: PaymentModeBadgeProps) {
  const label =
    mode === "CREDIT" && creditDays
      ? `Credit ${creditDays}D`
      : PAYMENT_MODE_LABELS[mode];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        MODE_STYLES[mode],
        className,
      )}
    >
      {label}
    </span>
  );
}
