import { SkeletonTable } from "@/components/common/skeleton-card";
import { SellerKpiSkeleton } from "@/components/seller/seller-kpi-card";

export function WorkbenchSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      <SellerKpiSkeleton count={7} />
      <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
      <SkeletonTable rows={8} />
    </div>
  );
}
