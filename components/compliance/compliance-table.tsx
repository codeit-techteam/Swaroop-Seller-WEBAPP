"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Download, Filter } from "lucide-react";

import { ComplianceRow } from "@/components/compliance/compliance-row";
import { EmptyState } from "@/components/compliance/empty-state";
import { Pagination } from "@/components/compliance/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  ComplianceDocument,
  ComplianceDocumentStatus,
  ComplianceFilters,
  ComplianceSort,
  ComplianceSortKey,
} from "@/types/compliance";

interface ComplianceTableProps {
  documents: ComplianceDocument[];
  selectedId: string | null;
  sort: ComplianceSort;
  page: number;
  pageSize: number;
  totalItems: number;
  filters: ComplianceFilters;
  hasFilters: boolean;
  onSort: (key: ComplianceSortKey) => void;
  onPageChange: (page: number) => void;
  onOpen: (document: ComplianceDocument) => void;
  onUpload: (document: ComplianceDocument) => void;
  onDownload: (document: ComplianceDocument) => void;
  onPreview: (document: ComplianceDocument) => void;
  onFastTrack: (document: ComplianceDocument) => void;
  onExport: () => void;
  onToggleFilters?: () => void;
  className?: string;
}

const columns: { key: ComplianceSortKey; label: string }[] = [
  { key: "name", label: "Document Name" },
  { key: "status", label: "Status" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "verifiedBy", label: "Verified By" },
  { key: "lastUpdated", label: "Last Updated" },
];

function getEmptyVariant(
  hasFilters: boolean,
  status: ComplianceFilters["status"],
): "no-documents" | "no-results" | "no-pending" {
  if (!hasFilters) return "no-documents";
  if (
    status === "pending_review" ||
    status === "uploaded" ||
    status === "rejected"
  ) {
    return "no-pending";
  }
  return "no-results";
}

export function ComplianceTable({
  documents,
  selectedId,
  sort,
  page,
  pageSize,
  totalItems,
  filters,
  hasFilters,
  onSort,
  onPageChange,
  onOpen,
  onUpload,
  onDownload,
  onPreview,
  onFastTrack,
  onExport,
  onToggleFilters,
  className,
}: ComplianceTableProps) {
  const emptyVariant = getEmptyVariant(
    hasFilters,
    filters.status as ComplianceDocumentStatus | "all",
  );

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
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Operational Certifications
          </h3>
          <p className="text-xs text-slate-500">
            {totalItems} document{totalItems === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleFilters ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleFilters}
              title="Filters"
            >
              <Filter className="h-4 w-4 text-slate-500" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onExport}
            title="Download table"
          >
            <Download className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="p-6">
          <EmptyState variant={emptyVariant} />
        </div>
      ) : (
        <>
          <div className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgb(241,245,249)]">
                <TableRow className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableHead key={column.key}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                        onClick={() => onSort(column.key)}
                      >
                        {column.label}
                        <ArrowDownUp
                          className={cn(
                            "h-3 w-3",
                            sort.key === column.key
                              ? "text-[#1B6EF3]"
                              : "text-slate-300",
                          )}
                        />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <ComplianceRow
                    key={document.id}
                    document={document}
                    active={selectedId === document.id}
                    onOpen={() => onOpen(document)}
                    onView={() => onOpen(document)}
                    onUpload={() => onUpload(document)}
                    onDownload={() => onDownload(document)}
                    onPreview={() => onPreview(document)}
                    onFastTrack={() => onFastTrack(document)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </>
      )}
    </motion.div>
  );
}
