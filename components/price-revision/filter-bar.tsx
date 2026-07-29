"use client";

import { format } from "date-fns";
import { CalendarDays, SlidersHorizontal } from "lucide-react";

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
import type { PriceRevisionFilters } from "@/types/price-revision";
import {
  PRICE_REVISION_STATUS_LABELS,
  PRICE_REVISION_STATUSES,
  PRICE_REVISION_WAREHOUSES,
  PRODUCT_GRADES,
} from "@/types/price-revision";

interface FilterBarProps {
  filters: PriceRevisionFilters;
  onFilterChange: <K extends keyof PriceRevisionFilters>(
    key: K,
    value: PriceRevisionFilters[K],
  ) => void;
  onClear: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  onClear,
  className,
}: FilterBarProps) {
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
      <div className="flex items-center gap-1.5 text-slate-500">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          Filters
        </span>
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
            {PRICE_REVISION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All Statuses"
                  ? "All Statuses"
                  : PRICE_REVISION_STATUS_LABELS[
                      s as keyof typeof PRICE_REVISION_STATUS_LABELS
                    ]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Product Grade
        </p>
        <Select
          value={filters.productGrade}
          onValueChange={(v) => onFilterChange("productGrade", v)}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_GRADES.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Warehouse
        </p>
        <Select
          value={filters.warehouse}
          onValueChange={(v) => onFilterChange("warehouse", v)}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_REVISION_WAREHOUSES.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Date Range
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-full justify-start gap-2 bg-white text-xs font-normal"
            >
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateFrom, to: dateTo }}
              onSelect={(range) => {
                onFilterChange(
                  "dateFrom",
                  range?.from ? range.from.toISOString() : "",
                );
                onFilterChange(
                  "dateTo",
                  range?.to ? range.to.toISOString() : "",
                );
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 text-xs text-slate-500 hover:text-slate-800"
        onClick={onClear}
      >
        Clear All
      </Button>
    </div>
  );
}
