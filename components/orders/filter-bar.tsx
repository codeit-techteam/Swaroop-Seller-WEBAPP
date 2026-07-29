"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderFilters } from "@/types/orders";
import {
  ORDER_PAYMENT_TYPES,
  ORDER_STATUSES,
  ORDER_WAREHOUSES,
  PAYMENT_TERM_LABELS,
} from "@/types/orders";

interface FilterBarProps {
  filters: OrderFilters;
  onFilterChange: <K extends keyof OrderFilters>(
    key: K,
    value: OrderFilters[K],
  ) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearchChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-wide text-slate-600"
        onClick={onClear}
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
      </Button>

      <Select
        value={filters.status}
        onValueChange={(v) => onFilterChange("status", v)}
      >
        <SelectTrigger className="h-8 w-[140px] border-slate-200 bg-white text-xs">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "All Status"
                ? s
                : s
                    .split("_")
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                    .join(" ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.warehouse}
        onValueChange={(v) => onFilterChange("warehouse", v)}
      >
        <SelectTrigger className="h-8 w-[150px] border-slate-200 bg-white text-xs">
          <SelectValue placeholder="All Warehouses" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_WAREHOUSES.map((w) => (
            <SelectItem key={w} value={w}>
              {w}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onFilterChange("dateFrom", e.target.value)}
        className="h-8 w-[140px] border-slate-200 bg-white text-xs"
      />

      <Select
        value={filters.paymentType}
        onValueChange={(v) => onFilterChange("paymentType", v)}
      >
        <SelectTrigger className="h-8 w-[160px] border-slate-200 bg-white text-xs">
          <SelectValue placeholder="Payment Type" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_PAYMENT_TYPES.map((p) => (
            <SelectItem key={p} value={p}>
              {p === "All Payment Types"
                ? p
                : PAYMENT_TERM_LABELS[p as keyof typeof PAYMENT_TERM_LABELS]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative ml-auto min-w-[200px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="h-8 border-slate-200 bg-white pl-8 text-xs"
        />
      </div>
    </div>
  );
}
