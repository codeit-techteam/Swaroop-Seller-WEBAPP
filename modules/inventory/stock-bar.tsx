import { formatMt } from "@/lib/seller/format";
import { stockShares } from "@/lib/seller/inventory";
import { cn } from "@/lib/utils";
import type { SellerProduct } from "@/types/seller";

export function StockCompositionBar({
  product,
  className,
}: {
  product: SellerProduct;
  className?: string;
}) {
  const shares = stockShares(product);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <span
          className="h-full bg-[#1B6EF3]"
          style={{ width: `${shares.sellable}%` }}
        />
        <span
          className="h-full bg-amber-400"
          style={{ width: `${shares.reserved}%` }}
        />
        <span
          className="h-full bg-slate-400"
          style={{ width: `${shares.committed}%` }}
        />
      </div>
      <p className="text-[11px] leading-tight text-slate-500">
        {formatMt(product.availableStock)} on hand
      </p>
    </div>
  );
}

export function StockBarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-3 rounded-full bg-[#1B6EF3]" />
        Sellable
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-3 rounded-full bg-amber-400" />
        Reserved
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-3 rounded-full bg-slate-400" />
        Committed
      </span>
    </div>
  );
}
