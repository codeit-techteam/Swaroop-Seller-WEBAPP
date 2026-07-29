"use client";

import { MapPin, Phone, Truck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { VehicleDriverInfo } from "@/types/shipments";

interface VehicleDriverCardProps {
  vehicleInfo: VehicleDriverInfo | null;
  className?: string;
}

export function VehicleDriverCard({
  vehicleInfo,
  className,
}: VehicleDriverCardProps) {
  if (!vehicleInfo) {
    return (
      <div className={cn("space-y-3", className)}>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Vehicle & Driver
        </h4>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <Truck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">
            Vehicle not assigned yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Vehicle & Driver
      </h4>
      <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#0B1F3A] text-xs font-semibold text-white">
              {vehicleInfo.driverAvatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800">
              {vehicleInfo.driverName}
            </p>
            <p className="text-xs text-slate-500">
              {vehicleInfo.transportCompany}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Truck No
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {vehicleInfo.truckNumber}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Capacity
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {vehicleInfo.capacityMt} MT
            </p>
          </div>
        </div>

        <a
          href={`tel:${vehicleInfo.driverPhone.replace(/\s/g, "")}`}
          className="flex items-center gap-2 text-sm text-[#1B6EF3] hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {vehicleInfo.driverPhone}
        </a>

        <div className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Current Location
            </p>
            <p className="text-xs font-medium text-slate-700">
              {vehicleInfo.currentLocation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
