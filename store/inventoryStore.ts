import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { inventoryMock, inventorySummaryMock } from "@/mock/inventory";
import type {
  InventoryFilters,
  InventoryItem,
  InventorySort,
  InventorySummary,
} from "@/types/inventory";

interface InventoryState {
  products: InventoryItem[];
  selectedProduct: InventoryItem | null;
  selectedIds: string[];
  filters: InventoryFilters;
  drawerOpen: boolean;
  offerModalOpen: boolean;
  page: number;
  pageSize: number;
  sort: InventorySort;
  summary: InventorySummary;
  isLoading: boolean;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof InventoryFilters>(
    key: K,
    value: InventoryFilters[K],
  ) => void;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSort: (key: InventorySort["key"]) => void;
  toggleSelected: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  openDrawer: (product: InventoryItem) => void;
  closeDrawer: () => void;
  setOfferModalOpen: (open: boolean) => void;
  getFilteredProducts: () => InventoryItem[];
  getPaginatedProducts: () => InventoryItem[];
  getComputedSummary: () => InventorySummary;
}

const defaultFilters: InventoryFilters = {
  search: "",
  grade: "All Grades",
  category: "All Categories",
  warehouse: "All Warehouses",
  status: "Status: Any",
};

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      products: inventoryMock,
      selectedProduct: null,
      selectedIds: [],
      filters: defaultFilters,
      drawerOpen: false,
      offerModalOpen: false,
      page: 1,
      pageSize: 8,
      sort: { key: "productName", direction: "asc" },
      summary: inventorySummaryMock,
      isLoading: false,
      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          page: 1,
        })),
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          page: 1,
        })),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          page: 1,
        })),
      resetFilters: () =>
        set({ filters: defaultFilters, page: 1, selectedIds: [] }),
      setPage: (page) => set({ page }),
      setSort: (key) => {
        const current = get().sort;
        set({
          sort: {
            key,
            direction:
              current.key === key && current.direction === "asc"
                ? "desc"
                : "asc",
          },
        });
      },
      toggleSelected: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((item) => item !== id)
            : [...state.selectedIds, id],
        })),
      toggleSelectAll: (ids) =>
        set((state) => ({
          selectedIds:
            state.selectedIds.length === ids.length && ids.length > 0
              ? []
              : ids,
        })),
      clearSelection: () => set({ selectedIds: [] }),
      openDrawer: (product) =>
        set({ selectedProduct: product, drawerOpen: true }),
      closeDrawer: () => set({ selectedProduct: null, drawerOpen: false }),
      setOfferModalOpen: (open) => set({ offerModalOpen: open }),
      getFilteredProducts: () => {
        const { products, filters, sort } = get();
        const query = filters.search.trim().toLowerCase();

        const filtered = products.filter((item) => {
          const matchesSearch =
            !query ||
            item.productName.toLowerCase().includes(query) ||
            item.grade.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.warehouseName.toLowerCase().includes(query);

          const matchesGrade =
            filters.grade === "All Grades" || item.grade === filters.grade;

          const matchesCategory =
            filters.category === "All Categories" ||
            item.category === filters.category;

          const matchesWarehouse =
            filters.warehouse === "All Warehouses" ||
            item.warehouseName === filters.warehouse;

          const matchesStatus =
            filters.status === "Status: Any" || item.status === filters.status;

          return (
            matchesSearch &&
            matchesGrade &&
            matchesCategory &&
            matchesWarehouse &&
            matchesStatus
          );
        });

        return [...filtered].sort((a, b) => {
          const left = a[sort.key];
          const right = b[sort.key];
          if (typeof left === "number" && typeof right === "number") {
            return sort.direction === "asc" ? left - right : right - left;
          }
          const cmp = String(left).localeCompare(String(right));
          return sort.direction === "asc" ? cmp : -cmp;
        });
      },
      getPaginatedProducts: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredProducts();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },
      getComputedSummary: () => {
        const filtered = get().getFilteredProducts();
        const totalInventory = filtered.reduce(
          (sum, item) => sum + item.availableMt,
          0,
        );
        const available = filtered
          .filter((item) => item.status === "IN_STOCK")
          .reduce((sum, item) => sum + item.availableMt, 0);
        const lowStock = filtered.filter(
          (item) => item.status === "LOW_STOCK",
        ).length;
        const outOfStock = filtered.filter(
          (item) => item.status === "OUT_OF_STOCK",
        ).length;

        return {
          totalInventory: Math.round(totalInventory),
          available: Math.round(available),
          lowStock,
          outOfStock,
          unit: "MT",
        };
      },
    }),
    { name: "inventory-store" },
  ),
);
