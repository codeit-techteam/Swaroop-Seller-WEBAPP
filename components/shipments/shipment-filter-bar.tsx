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
import { cn } from "@/lib/utils";
import type { ShipmentFilters } from "@/types/shipments";
import {
  SHIPMENT_LOCATIONS,
  SHIPMENT_STATUSES,
  SHIPMENT_TRANSPORTERS,
} from "@/types/shipments";

interface ShipmentFilterBarProps {
  filters: ShipmentFilters;
  onFilterChange: <K extends keyof ShipmentFilters>(
    key: K,
    value: ShipmentFilters[K],
  ) => void;
  onClear: () => void;
  className?: string;
}

function formatStatusLabel(status: string): string {
  if (status === "All Statuses") return status;
  return status
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function ShipmentFilterBar({
  filters,
  onFilterChange,
  onClear,
  className,
}: ShipmentFilterBarProps) {
  const hasActiveFilters =
    filters.status !== "All Statuses" ||
    filters.location !== "All Locations" ||
    filters.transporter !== "All Transporters" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Date Range
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateFrom ? filters.dateFrom.slice(0, 10) : ""}
            onChange={(e) =>
              onFilterChange(
                "dateFrom",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            className="h-9 w-[150px] border-slate-200 bg-white"
          />
          <span className="text-xs text-slate-400">–</span>
          <Input
            type="date"
            value={filters.dateTo ? filters.dateTo.slice(0, 10) : ""}
            onChange={(e) =>
              onFilterChange(
                "dateTo",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            className="h-9 w-[150px] border-slate-200 bg-white"
          />
        </div>
      </div>

      <div className="min-w-[140px] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Status
        </p>
        <Select
          value={filters.status}
          onValueChange={(v) => onFilterChange("status", v)}
        >
          <SelectTrigger className="h-9 border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHIPMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Location
        </p>
        <Select
          value={filters.location}
          onValueChange={(v) => onFilterChange("location", v)}
        >
          <SelectTrigger className="h-9 border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHIPMENT_LOCATIONS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Transporter
        </p>
        <Select
          value={filters.transporter}
          onValueChange={(v) => onFilterChange("transporter", v)}
        >
          <SelectTrigger className="h-9 border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHIPMENT_TRANSPORTERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters ? (
        <Button
          variant="link"
          className="h-9 px-2 text-[#1B6EF3]"
          onClick={onClear}
        >
          Clear Filters
        </Button>
      ) : null}
    </div>
  );
}
