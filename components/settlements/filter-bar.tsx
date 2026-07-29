"use client";

import { format } from "date-fns";
import { CalendarDays, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import type { SettlementFilters } from "@/types/settlements";
import {
  PAYMENT_MODES,
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_STATUSES,
  SETTLEMENT_WAREHOUSES,
} from "@/types/settlements";

interface FilterBarProps {
  filters: SettlementFilters;
  onFilterChange: <K extends keyof SettlementFilters>(
    key: K,
    value: SettlementFilters[K],
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
          onValueChange={(v) =>
            onFilterChange("status", v as SettlementFilters["status"])
          }
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SETTLEMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Statuses" : SETTLEMENT_STATUS_LABELS[s]}
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
          onValueChange={(v) =>
            onFilterChange("warehouse", v as SettlementFilters["warehouse"])
          }
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SETTLEMENT_WAREHOUSES.map((w) => (
              <SelectItem key={w} value={w}>
                {w === "all" ? "All Warehouses" : w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Payment Method
        </p>
        <Select
          value={filters.paymentMethod}
          onValueChange={(v) =>
            onFilterChange(
              "paymentMethod",
              v as SettlementFilters["paymentMethod"],
            )
          }
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_MODES.map((m) => (
              <SelectItem key={m} value={m}>
                {m === "all" ? "All Methods" : m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Date Range
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

      <div className="min-w-[100px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Min Amount
        </p>
        <Input
          type="number"
          placeholder="Min ₹"
          className="h-9 bg-white"
          value={filters.amountMin ?? ""}
          onChange={(e) =>
            onFilterChange(
              "amountMin",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        />
      </div>

      <div className="min-w-[100px] flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Max Amount
        </p>
        <Input
          type="number"
          placeholder="Max ₹"
          className="h-9 bg-white"
          value={filters.amountMax ?? ""}
          onChange={(e) =>
            onFilterChange(
              "amountMax",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        />
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
