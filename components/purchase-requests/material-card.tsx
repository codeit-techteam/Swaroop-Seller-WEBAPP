"use client";

import { cn } from "@/lib/utils";

interface MaterialCardProps {
  productGrade: string;
  mfi: string;
  quantityMt: number;
  unitPrice: number;
  className?: string;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function MaterialCard({
  productGrade,
  mfi,
  quantityMt,
  unitPrice,
  className,
}: MaterialCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-slate-900">Material Details</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Product Grade
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {productGrade}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            MFI Specification
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{mfi}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Total Quantity
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1B6EF3]">
            {quantityMt.toFixed(2)} MT
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Unit Price Req.
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {formatUsd(unitPrice)} / MT
          </p>
        </div>
      </div>
    </div>
  );
}
