export type InventoryStockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type StockMovementStatus = "completed" | "current" | "pending";

export interface StockMovement {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: StockMovementStatus;
  reference?: string;
}

export interface InventoryDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  grade: string;
  sku: string;
  category: string;
  description: string;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  availableMt: number;
  unit: string;
  offerPrice: number;
  status: InventoryStockStatus;
  moq: number;
  origin: string;
  capacityUtilized: number;
  lastUpdated: string;
  movements: StockMovement[];
  documents: InventoryDocument[];
  complianceNotes: string[];
}

export interface InventorySummary {
  totalInventory: number;
  available: number;
  reserved: number;
  warehouses: number;
  lowStock: number;
  outOfStock: number;
  unit: string;
}

export interface InventoryFilters {
  search: string;
  grade: string;
  category: string;
  warehouse: string;
  status: string;
}

export type InventorySortKey =
  | "productName"
  | "category"
  | "warehouseName"
  | "availableMt"
  | "offerPrice"
  | "status";

export interface InventorySort {
  key: InventorySortKey;
  direction: "asc" | "desc";
}
