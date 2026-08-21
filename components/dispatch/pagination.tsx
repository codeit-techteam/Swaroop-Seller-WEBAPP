"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "dispatches",
  className,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages && totalItems > 0;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    0,
    Math.min(totalPages, 7),
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold tabular-nums text-slate-700">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular-nums text-slate-700">
          {totalItems}
        </span>{" "}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => {
            if (canGoPrev) onPageChange(page - 1);
          }}
          className="h-8 rounded-lg border-slate-200"
        >
          Previous
        </Button>
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            size="sm"
            variant={pageNumber === page ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "h-8 min-w-8 rounded-lg border-slate-200 px-2",
              pageNumber === page &&
                "border-[#1B6EF3] bg-[#1B6EF3] text-white shadow-sm shadow-[#1B6EF3]/25 hover:bg-[#1558C8]",
            )}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant={canGoNext ? "default" : "outline"}
          size="sm"
          disabled={!canGoNext}
          onClick={() => {
            if (canGoNext) onPageChange(page + 1);
          }}
          className={cn(
            "h-8 rounded-lg",
            canGoNext
              ? "bg-[#1B6EF3] text-white hover:bg-[#1558C8]"
              : "border-slate-200",
          )}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
