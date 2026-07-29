"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProfileLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-2/3 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-4/5 max-w-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={4} />
        </div>
        <div className="space-y-6">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
      </div>

      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

function SkeletonCard({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
