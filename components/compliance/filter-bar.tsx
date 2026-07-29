"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  complianceDocumentTypeOptions,
  complianceStatusOptions,
} from "@/mock/compliance";
import type {
  ComplianceDocumentStatus,
  ComplianceDocumentType,
  ComplianceFilters,
  ExpiryWindow,
} from "@/types/compliance";
import {
  COMPLIANCE_STATUS_LABELS,
  EXPIRY_WINDOW_OPTIONS,
} from "@/types/compliance";

interface FilterBarProps {
  filters: ComplianceFilters;
  onFilterChange: <K extends keyof ComplianceFilters>(
    key: K,
    value: ComplianceFilters[K],
  ) => void;
  onReset: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  onReset,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.documentType !== "all" ||
    filters.expiryWindow !== "all";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Filters
      </p>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFilterChange("status", value as ComplianceDocumentStatus | "all")
        }
      >
        <SelectTrigger className="h-9 w-[170px] border-slate-200">
          <SelectValue placeholder="Document Status" />
        </SelectTrigger>
        <SelectContent>
          {complianceStatusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status === "all"
                ? "All Statuses"
                : COMPLIANCE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.documentType}
        onValueChange={(value) =>
          onFilterChange(
            "documentType",
            value as ComplianceDocumentType | "all",
          )
        }
      >
        <SelectTrigger className="h-9 w-[200px] border-slate-200">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          {complianceDocumentTypeOptions.map((type) => (
            <SelectItem key={type} value={type}>
              {type === "all" ? "All Document Types" : type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.expiryWindow}
        onValueChange={(value) =>
          onFilterChange("expiryWindow", value as ExpiryWindow)
        }
      >
        <SelectTrigger className="h-9 w-[180px] border-slate-200">
          <SelectValue placeholder="Expiry Status" />
        </SelectTrigger>
        <SelectContent>
          {EXPIRY_WINDOW_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-slate-600"
          onClick={onReset}
        >
          Reset
        </Button>
      ) : null}
    </div>
  );
}
