"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SlotBookingFilters } from "@/types/slot-booking";
import {
  SLOT_SHIFTS,
  SLOT_VEHICLE_TYPES,
  SLOT_WAREHOUSES,
} from "@/types/slot-booking";

interface BookingFilterBarProps {
  filters: SlotBookingFilters;
  onFilterChange: <K extends keyof SlotBookingFilters>(
    key: K,
    value: SlotBookingFilters[K],
  ) => void;
  onApply: () => void;
}

export function BookingFilterBar({
  filters,
  onFilterChange,
  onApply,
}: BookingFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="min-w-[150px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Warehouse
        </p>
        <Select
          value={filters.warehouse}
          onValueChange={(v) => onFilterChange("warehouse", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SLOT_WAREHOUSES.map((w) => (
              <SelectItem key={w} value={w}>
                {w === "Hazira" ? "Hazira Terminal" : w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Dispatch Date
        </p>
        <Input
          type="date"
          className="h-9"
          value={filters.dispatchDate}
          onChange={(e) => onFilterChange("dispatchDate", e.target.value)}
        />
      </div>

      <div className="min-w-[180px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Shift
        </p>
        <Select
          value={filters.shift}
          onValueChange={(v) => onFilterChange("shift", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SLOT_SHIFTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Type
        </p>
        <Select
          value={filters.vehicleType}
          onValueChange={(v) => onFilterChange("vehicleType", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SLOT_VEHICLE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "All Types" ? t : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="h-9 bg-[#0B1F3A] hover:bg-[#16345A]" onClick={onApply}>
        Apply Filters
      </Button>
    </div>
  );
}
