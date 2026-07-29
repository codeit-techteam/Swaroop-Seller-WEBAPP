"use client";

import { ActionDrawer } from "@/components/erp/action-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OfferReviewFilters } from "@/types/offer-review";

interface MoreFiltersDrawerProps {
  open: boolean;
  filters: OfferReviewFilters;
  onClose: () => void;
  onFilterChange: <K extends keyof OfferReviewFilters>(
    key: K,
    value: OfferReviewFilters[K],
  ) => void;
  onReset: () => void;
}

export function MoreFiltersDrawer({
  open,
  filters,
  onClose,
  onFilterChange,
  onReset,
}: MoreFiltersDrawerProps) {
  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title="More Filters"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Clear All
          </Button>
          <Button
            className="flex-1 bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                onFilterChange("dateFrom", event.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(event) => onFilterChange("dateTo", event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="minQuantity">Min Quantity (MT)</Label>
            <Input
              id="minQuantity"
              type="number"
              min={0}
              placeholder="0"
              value={filters.minQuantity}
              onChange={(event) =>
                onFilterChange("minQuantity", event.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxQuantity">Max Quantity (MT)</Label>
            <Input
              id="maxQuantity"
              type="number"
              min={0}
              placeholder="1000"
              value={filters.maxQuantity}
              onChange={(event) =>
                onFilterChange("maxQuantity", event.target.value)
              }
            />
          </div>
        </div>
      </div>
    </ActionDrawer>
  );
}
