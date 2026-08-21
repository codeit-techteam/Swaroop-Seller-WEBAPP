"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "page" | "drawer";
  className?: string;
}

export function LoadingSkeleton({
  variant = "page",
  className,
}: LoadingSkeletonProps) {
  if (variant === "drawer") {
    return (
      <div className={cn("space-y-4 p-5", className)}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-14 w-[320px] max-w-full" />
        <Skeleton className="h-14 w-36" />
        <Skeleton className="h-14 w-32" />
        <Skeleton className="h-14 w-40" />
        <Skeleton className="ml-auto h-9 w-72 max-w-full" />
      </div>

      <Skeleton className="h-11 w-full" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
