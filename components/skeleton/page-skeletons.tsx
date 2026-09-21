import { PageContainer } from "@/components/common/page-container";
import { SkeletonCard, SkeletonTable } from "@/components/common/skeleton-card";
import { SellerKpiSkeleton } from "@/components/seller/seller-kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  SkeletonBanner,
  SkeletonDetails,
  SkeletonForm,
  SkeletonStatsCard,
} from "./composites";

type ClassNameProps = {
  className?: string;
};

export function ProductTableSkeleton({
  className,
  rows = 8,
}: ClassNameProps & { rows?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-56" />
        <Skeleton className="h-10 w-full md:w-40" />
      </div>
      <SkeletonTable rows={rows} />
    </div>
  );
}

export function ProductsPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-4", className)}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <ProductTableSkeleton />
    </PageContainer>
  );
}

export function InventoryPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-5", className)}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <SellerKpiSkeleton count={5} />
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-40" />
        <Skeleton className="h-10 w-full md:w-40" />
        <Skeleton className="h-10 w-full md:w-40" />
      </div>
      <SkeletonTable rows={8} />
    </PageContainer>
  );
}

export function DashboardPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-6", className)}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
      <SkeletonBanner />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} />
    </PageContainer>
  );
}

export function OffersPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-5", className)}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <SellerKpiSkeleton count={4} />
      <Skeleton className="h-10 w-full max-w-sm" />
      <SkeletonTable rows={8} />
    </PageContainer>
  );
}

export function OrdersPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <SkeletonTable rows={8} />
    </PageContainer>
  );
}

export function RequestsPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-48" />
      </div>
      <SkeletonTable rows={8} />
    </PageContainer>
  );
}

export function DocumentsPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-28" />
      </div>
      <SkeletonTable rows={6} />
    </PageContainer>
  );
}

export function FormPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("max-w-3xl space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <SkeletonForm fields={7} />
    </PageContainer>
  );
}

export function DetailPageSkeleton({ className }: ClassNameProps) {
  return (
    <PageContainer className={cn("space-y-4", className)}>
      <SkeletonBanner />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonDetails rows={7} />
        <SkeletonDetails rows={5} />
      </div>
    </PageContainer>
  );
}
