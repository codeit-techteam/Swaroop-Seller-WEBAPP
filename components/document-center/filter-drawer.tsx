"use client";

import { ActionDrawer } from "@/components/erp/action-drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUS_LABELS,
  type DocumentCategory,
  type DocumentFilters,
  type DocumentStatus,
  EXPIRY_FILTER_OPTIONS,
} from "@/types/documents";

interface FilterDrawerProps {
  open: boolean;
  filters: DocumentFilters;
  onClose: () => void;
  onFilterChange: <K extends keyof DocumentFilters>(
    key: K,
    value: DocumentFilters[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const CATEGORIES = Object.entries(DOCUMENT_CATEGORY_LABELS) as [
  DocumentCategory,
  string,
][];

const STATUSES = Object.entries(DOCUMENT_STATUS_LABELS) as [
  DocumentStatus,
  string,
][];

export function FilterDrawer({
  open,
  filters,
  onClose,
  onFilterChange,
  onApply,
  onReset,
}: FilterDrawerProps) {
  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title="Filter Documents"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Reset
          </Button>
          <Button
            className="flex-1 bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={onApply}
          >
            Apply
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={filters.category}
            onValueChange={(v) =>
              onFilterChange("category", v as DocumentFilters["category"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              onFilterChange("status", v as DocumentFilters["status"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Expiry</Label>
          <Select
            value={filters.expiry}
            onValueChange={(v) =>
              onFilterChange("expiry", v as DocumentFilters["expiry"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All expiry windows" />
            </SelectTrigger>
            <SelectContent>
              {EXPIRY_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ActionDrawer>
  );
}
