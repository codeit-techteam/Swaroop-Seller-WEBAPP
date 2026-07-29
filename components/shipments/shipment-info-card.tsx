"use client";

import { format, parseISO } from "date-fns";
import { MapPin, Route } from "lucide-react";

import { StatusBadge } from "@/components/shipments/status-badge";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/types/shipments";

interface ShipmentInfoCardProps {
  shipment: Shipment;
  className?: string;
}

export function ShipmentInfoCard({
  shipment,
  className,
}: ShipmentInfoCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Shipment Information
      </h4>
      <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Shipment ID
            </p>
            <p className="font-semibold text-slate-800">
              {shipment.shipmentId}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Order ID
            </p>
            <p className="font-semibold text-slate-800">{shipment.orderId}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Source
            </p>
            <p className="text-sm font-medium text-slate-800">
              {shipment.sourceWarehouseLabel}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Destination
            </p>
            <p className="text-sm font-medium text-slate-800">
              {shipment.destinationWarehouse}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
          <Route className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            {shipment.distanceKm} km
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">
            ETA: {format(parseISO(shipment.eta), "dd MMM, yyyy")}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Current Status
          </p>
          <StatusBadge
            status={shipment.status}
            isDelayed={shipment.isDelayed}
          />
        </div>
      </div>
    </div>
  );
}
