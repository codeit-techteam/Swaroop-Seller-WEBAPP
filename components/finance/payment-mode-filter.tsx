"use client";

import { cn } from "@/lib/utils";
import {
  PAYMENT_MODE_LABELS,
  PAYMENT_MODES,
  type PaymentMode,
} from "@/types/finance";

interface PaymentModeFilterProps {
  value: PaymentMode | "ALL";
  onChange: (value: PaymentMode | "ALL") => void;
  counts: Record<PaymentMode | "ALL", number>;
}

export function PaymentModeFilter({
  value,
  onChange,
  counts,
}: PaymentModeFilterProps) {
  const options: Array<PaymentMode | "ALL"> = ["ALL", ...PAYMENT_MODES];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((mode) => {
        const active = value === mode;
        const label = mode === "ALL" ? "All modes" : PAYMENT_MODE_LABELS[mode];

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
              active
                ? "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                active
                  ? "bg-[#1B6EF3]/15 text-[#1B6EF3]"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {counts[mode] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
