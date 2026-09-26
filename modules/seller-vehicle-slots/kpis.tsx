"use client";

import {
  Ban,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  Truck,
} from "lucide-react";

import { SellerKpiCard } from "@/components/seller/seller-kpi-card";
import type { VehicleSlotSummary } from "@/types/vehicle-slots";

export function VehicleSlotKpis({
  summary,
  loading,
}: {
  summary?: VehicleSlotSummary | null;
  loading?: boolean;
}) {
  const today = summary?.today;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SellerKpiCard
        label="Today's Slots"
        value={loading ? "—" : (today?.total ?? 0)}
        icon={CalendarCheck}
      />
      <SellerKpiCard
        label="Booked"
        value={loading ? "—" : (today?.booked ?? 0)}
        icon={Truck}
      />
      <SellerKpiCard
        label="Available"
        value={loading ? "—" : (today?.available ?? 0)}
        icon={CircleDashed}
        tone="info"
      />
      <SellerKpiCard
        label="Completed"
        value={loading ? "—" : (today?.completed ?? 0)}
        icon={CheckCircle2}
        tone="success"
      />
      <SellerKpiCard
        label="Cancelled"
        value={loading ? "—" : (today?.cancelled ?? 0)}
        icon={Ban}
        tone="danger"
      />
    </div>
  );
}
