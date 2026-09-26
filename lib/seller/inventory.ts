import type {
  InventoryListItem,
  InventoryStockStatus,
} from "@/types/inventory";
import type { SellerLocation, SellerProduct } from "@/types/seller";

import { availableToSell } from "./format";

/** Fallback only when backend minStockQty is missing (legacy product rows). */
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
  // Backend availableQty is already the sellable pool (reserve depletes available).
  return Math.max(product.availableStock, 0);
}

export function inventoryStatus(
  product: Pick<
    SellerProduct,
    "availableStock" | "reservedStock" | "committedStock"
  > & { lowStockThreshold?: number | null },
  threshold = LOW_STOCK_THRESHOLD_MT,
): InventoryStockStatus {
  const remaining = Math.max(product.availableStock, 0);
  const lowThreshold =
    product.lowStockThreshold != null ? product.lowStockThreshold : threshold;
  if (remaining <= 0) return "OUT_OF_STOCK";
  if (remaining <= lowThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function inventoryItemStatus(
  item: Pick<
    InventoryListItem,
    "stockStatus" | "sellableQuantity" | "lowStockThreshold"
  >,
): InventoryStockStatus {
  if (item.stockStatus) return item.stockStatus;
  const qty = item.sellableQuantity;
  if (qty <= 0) return "OUT_OF_STOCK";
  if (item.lowStockThreshold != null && qty <= item.lowStockThreshold) {
    return "LOW_STOCK";
  }
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
  const total = Math.max(product.availableStock + product.reservedStock, 1);
  return {
    sellable: (sellable / total) * 100,
    reserved: (product.reservedStock / total) * 100,
    committed: (product.committedStock / total) * 100,
  };
}

export function inventoryListItemShares(item: InventoryListItem): {
  sellable: number;
} {
  const total = Math.max(item.onHandQuantity, item.sellableQuantity, 1);
  return {
    sellable: (item.sellableQuantity / total) * 100,
  };
}

export function toSellerProductCompat(item: InventoryListItem): SellerProduct {
  return {
    id: item.productId,
    category: item.category,
    gradeName: item.gradeName,
    manufacturer: "PRIVATE",
    gradeCode: item.gradeCode,
    polymerType: item.category,
    application: "",
    mfi: "",
    density: "",
    packagingType: "25 kg bags",
    unit: item.unit,
    availableStock: item.sellableQuantity,
    reservedStock: item.reservedStock,
    committedStock: item.committedStock,
    locationId: item.warehouseId,
    moq: item.moq,
    notes: "",
    offerStatus: "none",
    warehouse: item.warehouseName,
    inventoryId: item.inventoryId,
    offerId: item.offerId,
    gradeId: item.gradeId,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
  };
}

/** @deprecated Prefer sellableStock — availableQty is already sellable. */
export function legacyAvailableToSell(
  available: number,
  reserved: number,
  committed: number,
): number {
  return availableToSell(available, reserved, committed);
}
