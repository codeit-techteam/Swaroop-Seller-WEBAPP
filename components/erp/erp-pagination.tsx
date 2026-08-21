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

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
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
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);
  const canGoPrev = safePage > 1 && totalItems > 0;
  const canGoNext = safePage < safeTotalPages && totalItems > 0;
  const pages = pageWindow(safePage, safeTotalPages);

  function goTo(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), safeTotalPages);
    if (clamped !== safePage) {
      onPageChange(clamped);
    }
  }

  return (
    <div
      className={cn(
        "relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        {showingLabel ??
          (totalItems === 0
            ? "Showing 0 entries"
            : `Showing ${start}–${end} of ${totalItems} entries`)}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          aria-label="Previous page"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (canGoPrev) goTo(safePage - 1);
          }}
          className="h-8 border-slate-200 bg-white"
        >
          Previous
        </Button>

        {pages.map((pageNumber) => {
          const active = pageNumber === safePage;
          return (
            <Button
              key={pageNumber}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              aria-label={`Page ${pageNumber}`}
              aria-current={active ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goTo(pageNumber);
              }}
              className={cn(
                "h-8 min-w-8 px-2",
                active
                  ? "border-[#1B6EF3] bg-[#1B6EF3] text-white hover:bg-[#1558C8]"
                  : "border-slate-200 bg-white",
              )}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          type="button"
          variant={canGoNext ? "default" : "outline"}
          size="sm"
          disabled={!canGoNext}
          aria-label="Next page"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (canGoNext) goTo(safePage + 1);
          }}
          className={cn(
            "h-8",
            canGoNext
              ? "bg-[#1B6EF3] text-white hover:bg-[#1558C8]"
              : "border-slate-200 bg-white",
          )}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
