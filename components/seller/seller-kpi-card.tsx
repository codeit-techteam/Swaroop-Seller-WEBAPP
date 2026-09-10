import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SellerKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "info" | "warning" | "danger" | "success";
}) {
  const tones = {
    default: "bg-[#E8F1FF] text-[#1B6EF3]",
    info: "bg-[#E8F1FF] text-[#1B6EF3]",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    success: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function SellerKpiSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[92px] animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}
