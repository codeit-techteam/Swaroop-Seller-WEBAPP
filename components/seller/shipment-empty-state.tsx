"use client";

import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShipmentEmptyStateProps {
  className?: string;
}

export function ShipmentEmptyState({ className }: ShipmentEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center",
        className,
      )}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
        <Truck className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        No shipments found.
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        In-transit and delivered loads for this location will appear here.
      </p>
    </div>
  );
}
