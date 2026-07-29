"use client";

import { ErpPagination } from "@/components/erp/erp-pagination";
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

  return (
    <ErpPagination
      className={cn(className)}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  );
}
