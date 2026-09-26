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

/** Legacy inventory table row (unused by live Inventory page). */
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

/** Production inventory dashboard summary from GET /seller/inventory/summary */
export interface InventorySummary {
  onHand: number;
  sellable: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  warehouses: number;
  skuCount: number;
  unit: string;
}

/** @deprecated Legacy mock summary shape */
export interface LegacyInventorySummary {
  totalInventory: number;
  available: number;
  reserved: number;
  origins: number;
  lowStock: number;
  outOfStock: number;
  unit: string;
}

export interface InventoryListItem {
  id: string;
  inventoryId: string;
  productId: string;
  gradeId?: string;
  gradeName: string;
  gradeCode: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCity: string;
  onHandQuantity: number;
  sellableQuantity: number;
  /** Alias of sellableQuantity (backend availableQty) */
  availableStock: number;
  reservedStock: number;
  committedStock: number;
  unit: "MT" | "kg";
  moq: number;
  lowStockThreshold: number | null;
  stockStatus: InventoryStockStatus;
  offerId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface InventoryWarehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  onHand: number;
  sellable: number;
  grades: number;
}

export interface LatestStockMovement {
  id: string;
  inventoryId: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseName: string | null;
  warehouseCity: string | null;
  type: string;
  quantity: number;
  quantityDelta: number;
  unit: string;
  notes: string | null;
  timestamp: string;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  stockStatus?: InventoryStockStatus | "";
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InventoryFilters {
  search: string;
  grade: string;
  category: string;
  origin: string;
  status: string;
}

export type InventorySortKey =
  | "productName"
  | "category"
  | "origin"
  | "availableMt"
  | "offerPrice"
  | "status";

export interface InventorySort {
  key: InventorySortKey;
  direction: "asc" | "desc";
}
