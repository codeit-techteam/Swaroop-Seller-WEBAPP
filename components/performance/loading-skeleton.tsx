"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-xl" />;
}

export function TableSkeleton() {
  return <Skeleton className="h-[320px] w-full rounded-xl" />;
}

export function AlertsSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-xl" />;
}

export function ReportsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
