"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfferReviewPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function OfferReviewPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: OfferReviewPaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages && totalItems > 0;
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(0, Math.min(totalPages, 5));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing {start}-{end} of {totalItems} results
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
          className="h-8 border-slate-200 text-xs"
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
              "h-8 min-w-8 border-slate-200 px-2 text-xs",
              pageNumber === page &&
                "border-[#1B6EF3] bg-[#1B6EF3] text-white hover:bg-[#1558C8]",
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
            "h-8 text-xs",
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
