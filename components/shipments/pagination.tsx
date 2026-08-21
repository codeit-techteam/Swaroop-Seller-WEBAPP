"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages && totalItems > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-slate-100 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing {start}-{end} of {totalItems} shipments
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-slate-200"
          disabled={!canGoPrev}
          onClick={() => {
            if (canGoPrev) onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant={canGoNext ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8",
            canGoNext
              ? "bg-[#1B6EF3] text-white hover:bg-[#1558C8]"
              : "border-slate-200",
          )}
          disabled={!canGoNext}
          onClick={() => {
            if (canGoNext) onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
