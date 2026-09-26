import { apiClient } from "@/services/apiClient";
import type {
  InventoryListItem,
  InventoryListParams,
  InventorySummary,
  InventoryWarehouse,
  LatestStockMovement,
} from "@/types/inventory";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type BackendInventoryRow = {
  id: string;
  productId: string;
  gradeId?: string | null;
  gradeName?: string;
  gradeCode?: string;
  category?: string;
  warehouse?: {
    id: string;
    code?: string;
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
  onHandQuantity?: number | string;
  sellableQuantity?: number | string;
  availableQty?: number | string;
  reservedQty?: number | string;
  allocatedQty?: number | string;
  unit?: string;
  minimumOrderQuantity?: number | string | null;
  lowStockThreshold?: number | string | null;
  stockStatus?: string;
  status?: string;
  offerId?: string | null;
  updatedAt?: string;
  createdAt?: string;
  product?: {
    id?: string;
    code?: string;
    name?: string;
    gradeId?: string;
    unit?: string;
    status?: string;
    grade?: {
      id?: string;
      code?: string;
      name?: string;
      category?: { name?: string; code?: string } | null;
    } | null;
  };
};

type BackendSummary = {
  onHand?: { quantity?: number | string; unit?: string };
  sellable?: { quantity?: number | string; unit?: string };
  activeProducts?: number;
  lowStock?: number;
  outOfStock?: number;
  warehouses?: number;
  skuCount?: number;
  totalAvailable?: number;
  totalReserved?: number;
  totalAllocated?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  unit?: string;
};

type BackendMovement = {
  id: string;
  inventoryId?: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  warehouseId?: string | null;
  warehouseName?: string | null;
  warehouseCity?: string | null;
  type?: string;
  quantity?: number | string;
  quantityDelta?: number | string;
  unit?: string;
  notes?: string | null;
  timestamp?: string;
};

type BackendWarehouse = {
  id: string;
  code?: string;
  name: string;
  city?: string | null;
  state?: string | null;
  onHand?: number;
  sellable?: number;
  grades?: number;
};

function mapStockStatus(status?: string): InventoryListItem["stockStatus"] {
  if (status === "OUT_OF_STOCK") return "OUT_OF_STOCK";
  if (status === "LOW" || status === "LOW_STOCK") return "LOW_STOCK";
  return "IN_STOCK";
}

function mapInventoryRow(row: BackendInventoryRow): InventoryListItem {
  const available = Number(row.sellableQuantity ?? row.availableQty ?? 0);
  const reserved = Number(row.reservedQty ?? 0);
  const onHand = Number(row.onHandQuantity ?? available + reserved);
  const threshold =
    row.lowStockThreshold == null || row.lowStockThreshold === ""
      ? null
      : Number(row.lowStockThreshold);
  const moq =
    row.minimumOrderQuantity == null || row.minimumOrderQuantity === ""
      ? 0
      : Number(row.minimumOrderQuantity);

  return {
    id: row.id,
    inventoryId: row.id,
    productId: row.productId,
    gradeId: row.gradeId ?? row.product?.gradeId ?? undefined,
    gradeName: row.gradeName ?? row.product?.name ?? "Grade",
    gradeCode: row.gradeCode ?? row.product?.code ?? "",
    category:
      row.category ??
      row.product?.grade?.category?.name ??
      row.product?.grade?.name ??
      "Grade",
    warehouseId: row.warehouse?.id ?? "",
    warehouseName: row.warehouse?.name ?? "—",
    warehouseCity: row.warehouse?.city ?? "",
    onHandQuantity: onHand,
    sellableQuantity: available,
    availableStock: available,
    reservedStock: reserved,
    committedStock: Number(row.allocatedQty ?? 0),
    unit: row.unit === "kg" ? "kg" : "MT",
    moq,
    lowStockThreshold: threshold,
    stockStatus: mapStockStatus(row.stockStatus ?? row.status),
    offerId: row.offerId ?? undefined,
    updatedAt: row.updatedAt ?? new Date().toISOString(),
    createdAt: row.createdAt ?? row.updatedAt ?? new Date().toISOString(),
  };
}

function mapSummary(data: BackendSummary): InventorySummary {
  const unit = data.onHand?.unit ?? data.sellable?.unit ?? data.unit ?? "MT";
  return {
    onHand: Number(data.onHand?.quantity ?? data.totalAvailable ?? 0),
    sellable: Number(data.sellable?.quantity ?? data.totalAvailable ?? 0),
    activeProducts: Number(data.activeProducts ?? data.skuCount ?? 0),
    lowStock: Number(data.lowStock ?? data.lowStockCount ?? 0),
    outOfStock: Number(data.outOfStock ?? data.outOfStockCount ?? 0),
    warehouses: Number(data.warehouses ?? 0),
    skuCount: Number(data.skuCount ?? 0),
    unit,
  };
}

export async function fetchInventorySummary(): Promise<InventorySummary> {
  const response = await apiClient.get<Envelope<BackendSummary>>(
    `/seller/inventory/summary`,
  );
  return mapSummary(response.data.data ?? {});
}

export async function fetchSellerInventory(
  params: InventoryListParams = {},
): Promise<{
  items: InventoryListItem[];
  meta: NonNullable<Envelope<unknown>["meta"]>;
}> {
  const response = await apiClient.get<Envelope<BackendInventoryRow[]>>(
    `/seller/inventory`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search || undefined,
        warehouseId: params.warehouseId || undefined,
        stockStatus: params.stockStatus || undefined,
        status: params.status || undefined,
        sortBy: params.sortBy ?? "updatedAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    },
  );
  return {
    items: (response.data.data ?? []).map(mapInventoryRow),
    meta: response.data.meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function fetchLowStockInventory(
  limit = 8,
): Promise<InventoryListItem[]> {
  const response = await apiClient.get<Envelope<BackendInventoryRow[]>>(
    `/seller/inventory/low-stock`,
    { params: { page: 1, limit } },
  );
  return (response.data.data ?? []).map(mapInventoryRow);
}

export async function fetchLatestInventoryMovements(
  limit = 1,
): Promise<LatestStockMovement[]> {
  const response = await apiClient.get<Envelope<BackendMovement[]>>(
    `/seller/inventory/movements/latest`,
    { params: { limit } },
  );
  return (response.data.data ?? []).map((item) => ({
    id: item.id,
    inventoryId: item.inventoryId ?? "",
    productId: item.productId ?? "",
    productName: item.productName ?? "Inventory",
    productCode: item.productCode ?? "",
    warehouseName: item.warehouseName ?? null,
    warehouseCity: item.warehouseCity ?? null,
    type: item.type ?? "ADJUSTMENT",
    quantity: Number(item.quantity ?? 0),
    quantityDelta: Number(item.quantityDelta ?? item.quantity ?? 0),
    unit: item.unit ?? "MT",
    notes: item.notes ?? null,
    timestamp: item.timestamp ?? new Date().toISOString(),
  }));
}

export async function fetchSellerInventoryWarehouses(): Promise<
  InventoryWarehouse[]
> {
  const response = await apiClient.get<Envelope<BackendWarehouse[]>>(
    `/seller/inventory/warehouses`,
  );
  return (response.data.data ?? []).map((item) => ({
    id: item.id,
    code: item.code ?? "",
    name: item.name,
    city: item.city ?? "",
    state: item.state ?? "",
    onHand: Number(item.onHand ?? 0),
    sellable: Number(item.sellable ?? 0),
    grades: Number(item.grades ?? 0),
  }));
}

export async function adjustSellerInventoryStock(input: {
  inventoryId: string;
  quantityDelta: number;
  notes?: string;
  type?: string;
}) {
  const response = await apiClient.post(
    `/seller/inventory/${input.inventoryId}/adjust`,
    {
      quantityDelta: input.quantityDelta,
      type: input.type ?? "ADJUSTMENT",
      notes: input.notes ?? "Stock adjustment from seller portal",
    },
  );
  return response.data.data;
}
