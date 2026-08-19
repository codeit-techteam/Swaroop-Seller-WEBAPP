"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common";
import { ErpPagination } from "@/components/erp";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OpsTableProps {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
  extraFilters?: ReactNode;
  headers: string[];
  children: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  rowCount: number;
  toolbar?: ReactNode;
  hideControls?: boolean;
}

export function OpsTable({
  search,
  onSearch,
  searchPlaceholder = "Search...",
  status,
  onStatusChange,
  statusOptions,
  extraFilters,
  headers,
  children,
  emptyTitle,
  emptyDescription,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  rowCount,
  toolbar,
  hideControls = false,
}: OpsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {hideControls ? null : (
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All statuses" : option.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {extraFilters}
        {toolbar}
      </div>
      )}
      {rowCount === 0 ? (
        <div className="p-6">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      )}
      <ErpPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
