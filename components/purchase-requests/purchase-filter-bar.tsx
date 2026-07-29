"use client";

import { FilterX } from "lucide-react";

import { SearchBar } from "@/components/purchase-requests/search-bar";
import { purchaseStatusLabel } from "@/components/purchase-requests/status-badge";
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
import {
  MATERIAL_GRADES,
  PURCHASE_STATUSES,
  PURCHASE_WAREHOUSES,
} from "@/mock/purchase-requests";
import type { PurchaseRequestFilters } from "@/types/purchase-requests";

interface PurchaseFilterBarProps {
  filters: PurchaseRequestFilters;
  onFilterChange: <K extends keyof PurchaseRequestFilters>(
    key: K,
    value: PurchaseRequestFilters[K],
  ) => void;
  onSearchChange: (value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function PurchaseFilterBar({
  filters,
  onFilterChange,
  onSearchChange,
  onClearAll,
  className,
}: PurchaseFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {PURCHASE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {purchaseStatusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.materialGrade}
        onValueChange={(value) => onFilterChange("materialGrade", value)}
      >
        <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-sm">
          <SelectValue placeholder="Material Grade" />
        </SelectTrigger>
        <SelectContent>
          {MATERIAL_GRADES.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade === "All Grades" ? "All Grades" : grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.warehouse}
        onValueChange={(value) => onFilterChange("warehouse", value)}
      >
        <SelectTrigger className="h-9 w-[170px] border-slate-200 bg-white text-sm">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent>
          {PURCHASE_WAREHOUSES.map((warehouse) => (
            <SelectItem key={warehouse} value={warehouse}>
              {warehouse}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onFilterChange("dateFrom", event.target.value)}
          className="h-9 w-[145px] border-slate-200 bg-white text-sm"
          aria-label="Date from"
        />
        <span className="text-xs text-slate-400">to</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) => onFilterChange("dateTo", event.target.value)}
          className="h-9 w-[145px] border-slate-200 bg-white text-sm"
          aria-label="Date to"
        />
      </div>

      <SearchBar value={filters.search} onChange={onSearchChange} />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 gap-1.5 text-slate-600 hover:text-[#1B6EF3]"
        onClick={onClearAll}
      >
        <FilterX className="h-4 w-4" />
        Clear All
      </Button>
    </div>
  );
}
