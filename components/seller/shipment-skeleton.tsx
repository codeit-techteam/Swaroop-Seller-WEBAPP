"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ShipmentPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading shipments">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Skeleton className="h-11 w-full rounded-none" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-14 w-full rounded-none border-t border-slate-100"
          />
        ))}
      </div>
    </div>
  );
}
