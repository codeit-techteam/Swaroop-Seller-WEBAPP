import {
  Ban,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  Truck,
} from "lucide-react";

import { SellerKpiCard } from "@/components/seller/seller-kpi-card";
import { todayIsoDate } from "@/lib/seller-ops";
import type { VehicleSlot } from "@/types/seller-ops";

export function VehicleSlotKpis({ rows }: { rows: VehicleSlot[] }) {
  const today = todayIsoDate();
  const todays = rows.filter((item) => item.date === today && item.status !== "CANCELLED");
  const booked = rows.filter((item) => item.status === "BOOKED" || item.status === "ARRIVED" || item.status === "LOADING").length;
  const available = Math.max(todays.filter((item) => item.status === "BOOKED").length === 0 ? 6 : 6 - todays.length, 0);
  const completed = rows.filter((item) => item.status === "COMPLETED").length;
  const cancelled = rows.filter((item) => item.status === "CANCELLED").length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SellerKpiCard label="Today's Slots" value={todays.length} icon={CalendarCheck} />
      <SellerKpiCard label="Booked" value={booked} icon={Truck} />
      <SellerKpiCard label="Available" value={available} icon={CircleDashed} tone="info" />
      <SellerKpiCard
        label="Completed"
        value={completed}
        icon={CheckCircle2}
        tone="success"
      />
      <SellerKpiCard label="Cancelled" value={cancelled} icon={Ban} tone="danger" />
    </div>
  );
}
