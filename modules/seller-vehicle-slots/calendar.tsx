"use client";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { cn } from "@/lib/utils";
import type { SellerVehicleSlot } from "@/types/vehicle-slots";

function addDaysIso(baseIso: string, days: number): string {
  const [y, m, d] = baseIso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function startOfWeekIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  const day = date.getUTCDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function VehicleSlotCalendar({
  slots,
  selectedDate,
  onSelectDate,
  anchorDate,
}: {
  slots: SellerVehicleSlot[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** ISO date used as calendar window center/start. */
  anchorDate: string;
}) {
  const start = startOfWeekIso(anchorDate);
  const days = Array.from({ length: 14 }, (_, index) =>
    addDaysIso(start, index),
  );

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((day) => {
        const daySlots = slots.filter(
          (slot) =>
            slot.slotDate === day &&
            slot.status !== "CANCELLED" &&
            slot.status !== "MISSED" &&
            slot.status !== "NO_SHOW",
        );
        const count = daySlots.length;
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
              {new Date(`${day}T12:00:00`).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500">slots</p>
            {count >= 6 ? (
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
