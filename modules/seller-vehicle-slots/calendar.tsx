"use client";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { cn } from "@/lib/utils";
import type { VehicleSlot } from "@/types/seller-ops";

export function VehicleSlotCalendar({
  slots,
  selectedDate,
  onSelectDate,
}: {
  slots: VehicleSlot[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 8, 7 + index));
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((day) => {
        const count = slots.filter(
          (slot) => slot.date === day && slot.status !== "CANCELLED",
        ).length;
        const selected = selectedDate === day;
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDate(day)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              selected
                ? "border-[#1B6EF3] bg-[#E8F1FF]"
                : "border-slate-200 hover:bg-slate-50",
            )}
          >
            <p className="text-xs text-slate-500">
              {new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500">slots</p>
            {count >= 3 ? (
              <div className="mt-2">
                <SellerStatusBadge status="FULL" />
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
