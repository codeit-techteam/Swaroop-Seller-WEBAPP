"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PurchasePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PurchasePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PurchasePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(0, Math.min(totalPages, 7));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 pl-20 md:pl-28",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing {start}-{end} of {totalItems} requests
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 border-slate-200 px-2"
          aria-label="Previous page"
        >
          ‹
        </Button>
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="sm"
            variant={pageNumber === page ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "h-8 min-w-8 border-slate-200 px-2",
              pageNumber === page &&
                "border-[#1B6EF3] bg-[#1B6EF3] text-white hover:bg-[#1558C8]",
            )}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 border-slate-200 px-2"
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
