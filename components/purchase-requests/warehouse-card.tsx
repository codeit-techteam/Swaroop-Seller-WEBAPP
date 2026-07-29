"use client";

import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

interface WarehouseCardProps {
  label: string;
  address: string;
  className?: string;
}

export function WarehouseCard({
  label,
  address,
  className,
}: WarehouseCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3",
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#1B6EF3]">
        <MapPin className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Pickup Warehouse
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{address}</p>
      </div>
    </div>
  );
}
