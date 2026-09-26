import { isAxiosError } from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  adjustSellerInventoryStock,
  fetchInventorySummary,
  fetchLatestInventoryMovements,
  fetchLowStockInventory,
  fetchSellerInventory,
  fetchSellerInventoryWarehouses,
} from "@/services/inventory";
import { useAuthStore } from "@/store/authStore";
import type {
  InventoryListItem,
  InventoryStockStatus,
  InventorySummary,
  InventoryWarehouse,
  LatestStockMovement,
} from "@/types/inventory";

function isMissingSellerProfile(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (error.response?.status !== 404) return false;
  const message = error.response?.data?.message;
  return (
    typeof message === "string" &&
    message.toLowerCase().includes("seller profile")
  );
}

function isAuthRequired(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (error.response?.status === 401) return true;
  const message = error.response?.data?.message;
  return (
    typeof message === "string" &&
    message.toLowerCase().includes("authentication required")
  );
}

function inventoryErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
  }
  if (error instanceof Error) return error.message;
  return "Unable to load inventory.";
}

interface InventoryDashboardState {
  summary: InventorySummary | null;
  items: InventoryListItem[];
  alerts: InventoryListItem[];
  warehouses: InventoryWarehouse[];
  latestMovement: LatestStockMovement | null;
  total: number;
  page: number;
  limit: number;
  search: string;
  stockStatus: InventoryStockStatus | "all";
  warehouseId: string | "all";
  loading: boolean;
  loadError: string | null;
  adjusting: boolean;
  fetchDashboard: () => Promise<void>;
  setSearch: (search: string) => void;
  setStockStatus: (status: InventoryStockStatus | "all") => void;
  setWarehouseId: (warehouseId: string | "all") => void;
  adjustStock: (
    inventoryId: string,
    delta: number,
    reason: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  getByInventoryId: (id: string) => InventoryListItem | undefined;
  getByProductId: (id: string) => InventoryListItem | undefined;
}

async function loadAll(params: {
  search: string;
  stockStatus: InventoryStockStatus | "all";
  warehouseId: string | "all";
  page: number;
  limit: number;
}) {
  const [summary, list, alerts, warehouses, movements] = await Promise.all([
    fetchInventorySummary(),
    fetchSellerInventory({
      page: params.page,
      limit: params.limit,
      search: params.search.trim() || undefined,
      stockStatus:
        params.stockStatus === "all" ? undefined : params.stockStatus,
      warehouseId:
        params.warehouseId === "all" ? undefined : params.warehouseId,
      sortBy: "updatedAt",
      sortOrder: "desc",
    }),
    fetchLowStockInventory(8),
    fetchSellerInventoryWarehouses(),
    fetchLatestInventoryMovements(1),
  ]);

  return {
    summary,
    items: list.items,
    total: list.meta.total ?? list.items.length,
    alerts,
    warehouses,
    latestMovement: movements[0] ?? null,
  };
}

export const useInventoryDashboardStore = create<InventoryDashboardState>()(
  devtools(
    (set, get) => ({
      summary: null,
      items: [],
      alerts: [],
      warehouses: [],
      latestMovement: null,
      total: 0,
      page: 1,
      limit: 100,
      search: "",
      stockStatus: "all",
      warehouseId: "all",
      loading: true,
      loadError: null,
      adjusting: false,
      setSearch: (search) => set({ search }),
      setStockStatus: (stockStatus) => set({ stockStatus }),
      setWarehouseId: (warehouseId) => set({ warehouseId }),
      fetchDashboard: async () => {
        set({ loading: true, loadError: null });
        const state = get();
        try {
          const payload = await loadAll(state);
          set({
            ...payload,
            loading: false,
            loadError: null,
          });
        } catch (error) {
          if (isAuthRequired(error) || isMissingSellerProfile(error)) {
            try {
              const restored = await useAuthStore
                .getState()
                .ensureDemoSellerSession();
              if (restored.ok) {
                const payload = await loadAll(get());
                set({
                  ...payload,
                  loading: false,
                  loadError: null,
                });
                return;
              }
            } catch (retryError) {
              set({
                summary: null,
                items: [],
                alerts: [],
                warehouses: [],
                latestMovement: null,
                total: 0,
                loading: false,
                loadError: inventoryErrorMessage(retryError),
              });
              return;
            }
          }
          set({
            summary: null,
            items: [],
            alerts: [],
            warehouses: [],
            latestMovement: null,
            total: 0,
            loading: false,
            loadError: inventoryErrorMessage(error),
          });
        }
      },
      adjustStock: async (inventoryId, delta, reason) => {
        set({ adjusting: true });
        try {
          await adjustSellerInventoryStock({
            inventoryId,
            quantityDelta: delta,
            notes: reason,
          });
          await get().fetchDashboard();
          set({ adjusting: false });
          return { ok: true };
        } catch (error) {
          set({ adjusting: false });
          return {
            ok: false,
            message: inventoryErrorMessage(error),
          };
        }
      },
      getByInventoryId: (id) =>
        get().items.find((item) => item.inventoryId === id || item.id === id),
      getByProductId: (id) => get().items.find((item) => item.productId === id),
    }),
    { name: "inventory-dashboard-store" },
  ),
);
