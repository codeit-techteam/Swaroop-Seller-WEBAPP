"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-[72px] rounded-xl" />

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[120px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function NotificationCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}
