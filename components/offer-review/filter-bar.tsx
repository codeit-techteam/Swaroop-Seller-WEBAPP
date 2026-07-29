"use client";

import { format } from "date-fns";
import { CalendarDays, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { SearchBar } from "@/components/common/search-bar";
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
import {
  offerReviewStatusOptions,
  productGradeOptions,
  warehouseOptions,
} from "@/mock/offer-review";
import {
  OFFER_REVIEW_STATUS_LABELS,
  type OfferReviewFilters,
  type OfferReviewStatus,
} from "@/types/offer-review";

interface FilterBarProps {
  filters: OfferReviewFilters;
  onSearchChange: (value: string) => void;
  onFilterChange: <K extends keyof OfferReviewFilters>(
    key: K,
    value: OfferReviewFilters[K],
  ) => void;
  onReset: () => void;
  onMoreFilters: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  onSearchChange,
  onFilterChange,
  onReset,
  onMoreFilters,
  className,
}: FilterBarProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to: filters.dateTo ? new Date(filters.dateTo) : undefined,
  });

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.productGrade !== "all" ||
    filters.warehouse !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    Boolean(filters.minQuantity) ||
    Boolean(filters.maxQuantity);

  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`
      : range?.from
        ? format(range.from, "MMM dd, yyyy")
        : "Date Range";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        className,
      )}
    >
      <SearchBar
        value={filters.search}
        onChange={onSearchChange}
        placeholder="Search by Offer ID, Product Grade, or Warehouse..."
        className="max-w-sm flex-1 min-w-[220px]"
      />

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFilterChange("status", value as OfferReviewStatus | "all")
        }
      >
        <SelectTrigger className="h-9 w-[160px] border-slate-200">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {offerReviewStatusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status === "all"
                ? "All Statuses"
                : OFFER_REVIEW_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.productGrade}
        onValueChange={(value) => onFilterChange("productGrade", value)}
      >
        <SelectTrigger className="h-9 w-[150px] border-slate-200">
          <SelectValue placeholder="Product Grade" />
        </SelectTrigger>
        <SelectContent>
          {productGradeOptions.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade === "all" ? "All Grades" : grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.warehouse}
        onValueChange={(value) => onFilterChange("warehouse", value)}
      >
        <SelectTrigger className="h-9 w-[170px] border-slate-200">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent>
          {warehouseOptions.map((warehouse) => (
            <SelectItem key={warehouse} value={warehouse}>
              {warehouse === "all" ? "All Warehouses" : warehouse}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 gap-2 border-slate-200 px-3 text-sm font-normal text-slate-700"
          >
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {dateLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(selected) => {
              setRange(selected);
              if (selected?.from) {
                onFilterChange("dateFrom", format(selected.from, "yyyy-MM-dd"));
              }
              if (selected?.to) {
                onFilterChange("dateTo", format(selected.to, "yyyy-MM-dd"));
                setDateOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-slate-200"
        onClick={onMoreFilters}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        More Filters
      </Button>

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-slate-600"
          onClick={() => {
            setRange(undefined);
            onReset();
          }}
        >
          <Filter className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      ) : null}
    </div>
  );
}
