import { formatMt } from "@/lib/seller/format";
import { inventoryListItemShares, stockShares } from "@/lib/seller/inventory";
import { cn } from "@/lib/utils";
import type { InventoryListItem } from "@/types/inventory";
import type { SellerProduct } from "@/types/seller";

export function StockCompositionBar({
  product,
  item,
  className,
}: {
  product?: SellerProduct;
  item?: InventoryListItem;
  className?: string;
}) {
  if (item) {
    const shares = inventoryListItemShares(item);
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
          <span
            className="h-full bg-[#1B6EF3]"
            style={{ width: `${shares.sellable}%` }}
          />
        </div>
        <p className="text-[11px] leading-tight text-slate-500">
          {formatMt(item.sellableQuantity)} sellable
        </p>
      </div>
    );
  }

  if (!product) return null;
  const shares = stockShares(product);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <span
          className="h-full bg-[#1B6EF3]"
          style={{ width: `${shares.sellable}%` }}
        />
      </div>
      <p className="text-[11px] leading-tight text-slate-500">
        {formatMt(product.availableStock)} sellable
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
    </div>
  );
}
