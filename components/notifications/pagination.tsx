"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationPaginationProps {
  visibleCount: number;
  totalCount: number;
  onLoadMore: () => void;
  className?: string;
}

export function NotificationPagination({
  visibleCount,
  totalCount,
  onLoadMore,
  className,
}: NotificationPaginationProps) {
  const hasMore = visibleCount < totalCount;

  if (totalCount === 0) return null;

  return (
    <div className={cn("pt-2", className)}>
      {hasMore ? (
        <Button
          variant="outline"
          onClick={onLoadMore}
          className="h-11 w-full border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 hover:bg-slate-50"
        >
          Load Older Notifications
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <p className="py-3 text-center text-xs text-slate-400">
          Showing all {totalCount} notifications
        </p>
      )}
    </div>
  );
}
