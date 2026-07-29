"use client";

import { ErpPagination } from "@/components/erp";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) return null;

  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white", className)}
    >
      <ErpPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        className="border-t-0"
      />
    </div>
  );
}
