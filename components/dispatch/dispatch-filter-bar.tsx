"use client";

import { Filter, MapPin, Package, RotateCcw, Warehouse } from "lucide-react";

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
  const hasActiveFilters =
    filters.warehouse !== "All Warehouses" ||
    filters.status !== "All Statuses" ||
    filters.destination !== "All Destinations" ||
    filters.material !== "All Materials";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Filter className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Filters</p>
        {hasActiveFilters ? (
          <span className="rounded-full bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1B6EF3]">
            Active
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[150px] flex-1 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <Warehouse className="h-3 w-3" />
            Warehouse
          </p>
          <Select
            value={filters.warehouse}
            onValueChange={(v) => onFilterChange("warehouse", v)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 transition-colors hover:bg-white">
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

        <div className="min-w-[150px] flex-1 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <Filter className="h-3 w-3" />
            Status
          </p>
          <Select
            value={filters.status}
            onValueChange={(v) => onFilterChange("status", v)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 transition-colors hover:bg-white">
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

        <div className="min-w-[170px] flex-1 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <MapPin className="h-3 w-3" />
            Destination
          </p>
          <Select
            value={filters.destination}
            onValueChange={(v) => onFilterChange("destination", v)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 transition-colors hover:bg-white">
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

        <div className="min-w-[150px] flex-1 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <Package className="h-3 w-3" />
            Material
          </p>
          <Select
            value={filters.material}
            onValueChange={(v) => onFilterChange("material", v)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/60 transition-colors hover:bg-white">
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
          className="h-10 gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
