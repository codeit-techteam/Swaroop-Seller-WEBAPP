"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Filter,
} from "lucide-react";

import { EmptyState } from "@/components/settlements/empty-state";
import { FilterBar } from "@/components/settlements/filter-bar";
import { Pagination } from "@/components/settlements/pagination";
import { SearchBar } from "@/components/settlements/search-bar";
import { SettlementRow } from "@/components/settlements/settlement-row";
import { Button } from "@/components/ui/button";
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
  Settlement,
  SettlementFilters,
  SettlementSort,
  SettlementSortKey,
} from "@/types/settlements";

const SORTABLE_COLUMNS: { key: SettlementSortKey; label: string }[] = [
  { key: "settlementId", label: "Settlement ID" },
  { key: "orderRef", label: "Order Reference" },
  { key: "product", label: "Product" },
  { key: "quantityMt", label: "Quantity (MT)" },
  { key: "invoiceAmount", label: "Invoice Amount" },
  { key: "netSettlement", label: "Net Settlement" },
  { key: "paymentDate", label: "Payment Date" },
  { key: "status", label: "Settlement Status" },
];

interface SettlementTableProps {
  settlements: Settlement[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: SettlementSort;
  filters: SettlementFilters;
  isLoading?: boolean;
  hasFilters?: boolean;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onPageChange: (page: number) => void;
  onSort: (key: SettlementSortKey) => void;
  onFilterChange: <K extends keyof SettlementFilters>(
    key: K,
    value: SettlementFilters[K],
  ) => void;
  onClearFilters: () => void;
  onSearchChange: (search: string) => void;
  onSelect: (settlement: Settlement) => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  className?: string;
}

function SortIcon({
  columnKey,
  sort,
}: {
  columnKey: SettlementSortKey;
  sort: SettlementSort;
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

export function SettlementTable({
  settlements,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  sort,
  filters,
  isLoading,
  hasFilters,
  showFilters,
  onToggleFilters,
  onPageChange,
  onSort,
  onFilterChange,
  onClearFilters,
  onSearchChange,
  onSelect,
  onExportCsv,
  onExportExcel,
  className,
}: SettlementTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Recent Settlements
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onToggleFilters}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
          {onExportCsv ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onExportCsv}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          ) : null}
          {onExportExcel ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onExportExcel}
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-slate-100 px-4 py-3">
        <SearchBar
          value={filters.search}
          onChange={onSearchChange}
          placeholder="Search Settlement ID, Order ID, Invoice, Buyer Company..."
        />
      </div>

      {showFilters ? (
        <div className="border-b border-slate-100 px-4 py-3">
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            onClear={onClearFilters}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              {SORTABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  <SortIcon columnKey={col.key} sort={sort} />
                </TableHead>
              ))}
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 9 }).map((__, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading &&
              settlements.map((settlement) => (
                <SettlementRow
                  key={settlement.id}
                  settlement={settlement}
                  active={selectedId === settlement.id}
                  onSelect={() => onSelect(settlement)}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && settlements.length === 0 ? (
        <div className="p-6">
          <EmptyState variant="no-settlements" hasFilters={hasFilters} />
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
