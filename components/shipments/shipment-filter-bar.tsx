"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

import { SearchBar } from "./search-bar";

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
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

  const dateLabel =
    dateFrom && dateTo
      ? `${format(dateFrom, "MMM dd")} - ${format(dateTo, "MMM dd")}`
      : dateFrom
        ? format(dateFrom, "MMM dd, yyyy")
        : "Date Range";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3",
        className,
      )}
    >
      <div className="min-w-[200px] flex-[2] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Search
        </p>
        <SearchBar
          value={filters.search}
          onChange={(v) => onFilterChange("search", v)}
          placeholder="Shipment ID or Order ID..."
        />
      </div>

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Status
        </p>
        <Select
          value={filters.status}
          onValueChange={(v) => onFilterChange("status", v)}
        >
          <SelectTrigger className="h-9 bg-white">
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

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Location
        </p>
        <Select
          value={filters.location}
          onValueChange={(v) => onFilterChange("location", v)}
        >
          <SelectTrigger className="h-9 bg-white">
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

      <div className="min-w-[150px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Transporter
        </p>
        <Select
          value={filters.transporter}
          onValueChange={(v) => onFilterChange("transporter", v)}
        >
          <SelectTrigger className="h-9 bg-white">
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

      <div className="min-w-[160px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Date
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-full justify-start gap-2 bg-white font-normal text-slate-600"
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm">{dateLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateFrom, to: dateTo }}
              onSelect={(range) => {
                onFilterChange(
                  "dateFrom",
                  range?.from ? range.from.toISOString() : null,
                );
                onFilterChange(
                  "dateTo",
                  range?.to ? range.to.toISOString() : null,
                );
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="link"
        className="h-9 px-2 text-[#1B6EF3]"
        onClick={onClear}
      >
        Clear Filters
      </Button>
    </div>
  );
}
