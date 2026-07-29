"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { EmptyState } from "@/components/price-revision/empty-state";
import { FilterBar } from "@/components/price-revision/filter-bar";
import { Pagination } from "@/components/price-revision/pagination";
import { PriceRevisionRow } from "@/components/price-revision/price-revision-row";
import { SearchBar } from "@/components/price-revision/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  PriceRevisionFilters,
  PriceRevisionRequest,
  PriceRevisionSort,
  PriceRevisionSortKey,
} from "@/types/price-revision";

const SORTABLE_COLUMNS: { key: PriceRevisionSortKey | null; label: string }[] =
  [
    { key: "requestId", label: "Request ID" },
    { key: "productGrade", label: "Product Grade" },
    { key: "currentPrice", label: "Current Price" },
    { key: "suggestedPrice", label: "Suggested Price" },
    { key: null, label: "Reason" },
    { key: "deadline", label: "Deadline" },
    { key: "status", label: "Status" },
  ];

interface PriceRevisionTableProps {
  requests: PriceRevisionRequest[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: PriceRevisionSort;
  filters: PriceRevisionFilters;
  isLoading?: boolean;
  hasFilters?: boolean;
  onPageChange: (page: number) => void;
  onSort: (key: PriceRevisionSortKey) => void;
  onFilterChange: <K extends keyof PriceRevisionFilters>(
    key: K,
    value: PriceRevisionFilters[K],
  ) => void;
  onClearFilters: () => void;
  onSearchChange: (search: string) => void;
  onSelect: (request: PriceRevisionRequest) => void;
  onReview: (request: PriceRevisionRequest) => void;
  onViewStatus: (request: PriceRevisionRequest) => void;
  onDetails: (request: PriceRevisionRequest) => void;
  onHistory: (request: PriceRevisionRequest) => void;
  className?: string;
}

function SortIcon({
  columnKey,
  sort,
}: {
  columnKey: PriceRevisionSortKey;
  sort: PriceRevisionSort;
}) {
  if (sort.key !== columnKey) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-slate-300" />;
  }
  return sort.direction === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3 text-[#1B6EF3]" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3 text-[#1B6EF3]" />
  );
}

export function PriceRevisionTable({
  requests,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  sort,
  filters,
  isLoading,
  hasFilters,
  onPageChange,
  onSort,
  onFilterChange,
  onClearFilters,
  onSearchChange,
  onSelect,
  onReview,
  onViewStatus,
  onDetails,
  onHistory,
  className,
}: PriceRevisionTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="space-y-3 border-b border-slate-100 p-4">
        <SearchBar value={filters.search} onChange={onSearchChange} />
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          onClear={onClearFilters}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              {SORTABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col.label}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
                    col.key && "cursor-pointer select-none",
                  )}
                  onClick={() => col.key && onSort(col.key)}
                >
                  {col.label}
                  {col.key ? (
                    <SortIcon columnKey={col.key} sort={sort} />
                  ) : null}
                </TableHead>
              ))}
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((__, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading &&
              requests.map((request) => (
                <PriceRevisionRow
                  key={request.id}
                  request={request}
                  active={selectedId === request.id}
                  onSelect={() => onSelect(request)}
                  onReview={() => onReview(request)}
                  onViewStatus={() => onViewStatus(request)}
                  onDetails={() => onDetails(request)}
                  onHistory={() => onHistory(request)}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && requests.length === 0 ? (
        <div className="p-6">
          <EmptyState hasFilters={hasFilters} />
        </div>
      ) : null}

      {!isLoading && totalItems > 0 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      ) : null}
    </motion.div>
  );
}
