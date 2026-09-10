import type { InventoryStockStatus } from "@/types/inventory";
import type { SellerLocation, SellerProduct } from "@/types/seller";

import { availableToSell } from "./format";

export const LOW_STOCK_THRESHOLD_MT = 80;

export const STOCK_ADJUSTMENT_REASONS = [
  "New Procurement",
  "Inventory Adjustment",
  "Physical Count",
  "Quality Hold",
  "Damage / Write-off",
  "Dispatch Release",
  "Manual Correction",
] as const;

export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

export function sellableStock(product: SellerProduct): number {
  return availableToSell(
    product.availableStock,
    product.reservedStock,
    product.committedStock,
  );
}

export function inventoryStatus(
  product: Pick<
    SellerProduct,
    "availableStock" | "reservedStock" | "committedStock"
  >,
  threshold = LOW_STOCK_THRESHOLD_MT,
): InventoryStockStatus {
  const remaining = availableToSell(
    product.availableStock,
    product.reservedStock,
    product.committedStock,
  );
  if (remaining <= 0) return "OUT_OF_STOCK";
  if (remaining <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function inventoryStatusLabel(status: InventoryStockStatus): string {
  if (status === "IN_STOCK") return "In Stock";
  if (status === "LOW_STOCK") return "Low Stock";
  return "Out of Stock";
}

export function warehouseForProduct(
  product: SellerProduct,
  location?: SellerLocation,
): string {
  return product.warehouse || location?.warehouse || location?.name || "—";
}

export function stockShares(product: SellerProduct): {
  sellable: number;
  reserved: number;
  committed: number;
} {
  const sellable = sellableStock(product);
  const total = Math.max(
    product.availableStock,
    sellable + product.reservedStock + product.committedStock,
    1,
  );
  return {
    sellable: (sellable / total) * 100,
    reserved: (product.reservedStock / total) * 100,
    committed: (product.committedStock / total) * 100,
  };
}
