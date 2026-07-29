"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ComplianceLoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComplianceDrawerSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-56 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function PreviewSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-56 w-full rounded-xl", className)} />;
}
