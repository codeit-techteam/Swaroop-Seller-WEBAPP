import { SkeletonTable } from "@/components/common/skeleton-card";
import { SellerKpiSkeleton } from "@/components/seller/seller-kpi-card";

export function PriceRevisionSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      <SellerKpiSkeleton count={5} />
      <SkeletonTable rows={8} />
    </div>
  );
}
