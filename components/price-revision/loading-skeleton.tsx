"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SummaryCardsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <Skeleton className="mb-3 h-10 w-full" />
      <Skeleton className="mb-4 h-24 w-full" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="mb-2 h-12 w-full" />
      ))}
    </div>
  );
}

export function DrawerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TimelineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-3 w-28" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <SummaryCardsSkeleton />
      <TableSkeleton />
    </div>
  );
}
