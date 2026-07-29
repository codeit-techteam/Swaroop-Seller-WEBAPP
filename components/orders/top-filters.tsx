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
import type { OrderFilters, OrderValueRange } from "@/types/orders";
import { ORDER_VALUE_RANGES } from "@/types/orders";

interface TopFiltersProps {
  filters: OrderFilters;
  onFilterChange: <K extends keyof OrderFilters>(
    key: K,
    value: OrderFilters[K],
  ) => void;
  onApply: () => void;
}

export function TopFilters({
  filters,
  onFilterChange,
  onApply,
}: TopFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Date Range
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            className="h-9 w-[150px] border-slate-200 bg-white"
          />
          <span className="text-xs text-slate-400">–</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange("dateTo", e.target.value)}
            className="h-9 w-[150px] border-slate-200 bg-white"
          />
        </div>
      </div>

      <div className="min-w-[160px] space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Order Value
        </p>
        <Select
          value={filters.orderValue}
          onValueChange={(v) =>
            onFilterChange("orderValue", v as OrderValueRange)
          }
        >
          <SelectTrigger className="h-9 border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_VALUE_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="h-9 bg-[#1B6EF3] hover:bg-[#1558C8]" onClick={onApply}>
        Apply Filters
      </Button>
    </div>
  );
}
