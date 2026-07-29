"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DispatchFilters } from "@/types/dispatch";
import {
  DISPATCH_MATERIALS,
  DISPATCH_STATUSES,
  DISPATCH_WAREHOUSES,
} from "@/types/dispatch";

const DESTINATIONS = [
  "All Destinations",
  "Jamnagar Hub, Gujarat",
  "Navi Mumbai Storage",
  "Pune Industrial Estate",
  "Ahmedabad Depot",
  "Nagpur Terminal",
  "Indore Warehouse",
  "Hyderabad CFS",
  "Chennai Port Yard",
  "Vadodara Plant",
  "Surat Logistics Park",
];

interface DispatchFilterBarProps {
  filters: DispatchFilters;
  onFilterChange: <K extends keyof DispatchFilters>(
    key: K,
    value: DispatchFilters[K],
  ) => void;
  onClear: () => void;
}

export function DispatchFilterBar({
  filters,
  onFilterChange,
  onClear,
}: DispatchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="min-w-[140px] flex-1 space-y-1">
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
            {DISPATCH_WAREHOUSES.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Status
        </p>
        <Select
          value={filters.status}
          onValueChange={(v) => onFilterChange("status", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISPATCH_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All Statuses"
                  ? s
                  : s
                      .split("_")
                      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                      .join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Destination
        </p>
        <Select
          value={filters.destination}
          onValueChange={(v) => onFilterChange("destination", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESTINATIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Material
        </p>
        <Select
          value={filters.material}
          onValueChange={(v) => onFilterChange("material", v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISPATCH_MATERIALS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="h-9 border-slate-200"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}
