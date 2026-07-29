"use client";

import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TransportDetails } from "@/types/orders";

interface TransportCardProps {
  transport: TransportDetails | null;
  className?: string;
}

export function TransportCard({ transport, className }: TransportCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Transport Details
      </h4>
      {transport ? (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Carrier
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {transport.carrier}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Vehicle No.
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {transport.vehicleNumber}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Driver
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {transport.driver}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              ETA
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {transport.eta}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
          <Truck className="h-4 w-4" />
          Transport not assigned yet
        </div>
      )}
    </div>
  );
}
