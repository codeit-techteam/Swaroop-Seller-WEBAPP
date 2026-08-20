"use client";

import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TransportInfo } from "@/types/dispatch";

interface TransportCardProps {
  transport: TransportInfo | null;
  className?: string;
}

export function TransportCard({ transport, className }: TransportCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Transport Info
      </h4>
      {!transport ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-7 text-center">
          <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80">
            <Truck className="h-[18px] w-[18px]" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            No vehicle assigned yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Assign a truck to continue loading
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {transport.vehicleNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                {transport.transportCompany}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Capacity
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.capacityMt} MT
              </p>
            </div>
            <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Driver
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.driver}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                ETA Terminal
              </p>
              <p className="mt-0.5 font-semibold text-emerald-600">
                {transport.eta}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Loading Bay
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                Bay {transport.loadingBay}
              </p>
            </div>
            <div className="col-span-2 rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Estimated Departure
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.estimatedDeparture}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
