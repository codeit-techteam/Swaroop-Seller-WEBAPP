"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErpPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  showingLabel?: string;
}

export function ErpPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
  showingLabel,
}: ErpPaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        {showingLabel ?? `Showing ${start} of ${totalItems} entries`}
        {!showingLabel && totalItems > pageSize ? ` (${start}–${end})` : null}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 border-slate-200"
        >
          Previous
        </Button>
        <Button
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 bg-[#1B6EF3] hover:bg-[#1558C8]"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
