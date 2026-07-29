"use client";

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
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No vehicle assigned yet
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Vehicle No
              </p>
              <p className="mt-0.5 font-bold text-slate-900">
                {transport.vehicleNumber}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Capacity
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.capacityMt} MT
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Driver
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.driver}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                ETA Terminal
              </p>
              <p className="mt-0.5 font-semibold text-emerald-600">
                {transport.eta}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Transport Co.
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {transport.transportCompany}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Loading Bay
              </p>
              <p className="mt-0.5 font-semibold text-slate-800">
                Bay {transport.loadingBay}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
