import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { fetchSellerProducts } from "@/services/catalog";
import type {
  InventoryFilters,
  InventoryItem,
  InventorySort,
  InventorySummary,
} from "@/types/inventory";
import type { SellerProduct } from "@/types/seller";

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
  fetchInventory: () => Promise<void>;
  getFilteredProducts: () => InventoryItem[];
  getPaginatedProducts: () => InventoryItem[];
  getComputedSummary: () => InventorySummary;
}

const emptySummary: InventorySummary = {
  totalInventory: 0,
  available: 0,
  reserved: 0,
  origins: 0,
  lowStock: 0,
  outOfStock: 0,
  unit: "MT",
};

function mapSellerProductToInventory(product: SellerProduct): InventoryItem {
  const availableMt = product.availableStock;
  const status: InventoryItem["status"] =
    availableMt <= 0 ? "OUT_OF_STOCK" : availableMt < 20 ? "LOW_STOCK" : "IN_STOCK";
  return {
    id: product.id,
    productId: product.id,
    productName: product.gradeName,
    grade: product.polymerType || product.gradeCode,
    sku: product.gradeCode,
    category: product.category,
    description: product.notes || product.application,
    warehouseId: product.locationId,
    warehouseName: "Verified Hub",
    warehouseAddress: "",
    availableMt,
    unit: product.unit,
    offerPrice: Number(product.basePrice ?? 0),
    status,
    moq: product.moq,
    origin: "",
    capacityUtilized: 0,
    lastUpdated: product.updatedAt,
    movements: [],
    documents: [],
    complianceNotes: [],
  };
}

const defaultFilters: InventoryFilters = {
  search: "",
  grade: "All Grades",
  category: "All Categories",
  origin: "All Origins",
  status: "Status: Any",
};

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      products: [],
      selectedProduct: null,
      selectedIds: [],
      filters: defaultFilters,
      drawerOpen: false,
      offerModalOpen: false,
      page: 1,
      pageSize: 8,
      sort: { key: "productName", direction: "asc" },
      summary: emptySummary,
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
      setPage: (page) => {
        const { pageSize } = get();
        const totalPages = Math.max(
          1,
          Math.ceil(get().getFilteredProducts().length / pageSize),
        );
        set({ page: Math.min(Math.max(1, page), totalPages) });
      },
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
      fetchInventory: async () => {
        set({ isLoading: true });
        try {
          const products = (await fetchSellerProducts()).map(mapSellerProductToInventory);
          set({ products, isLoading: false });
          set({ summary: get().getComputedSummary() });
        } catch {
          set({ products: [], isLoading: false, summary: emptySummary });
        }
      },
      getFilteredProducts: () => {
        const { products, filters, sort } = get();
        const query = filters.search.trim().toLowerCase();

        const filtered = products.filter((item) => {
          const matchesSearch =
            !query ||
            item.productName.toLowerCase().includes(query) ||
            item.grade.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.origin.toLowerCase().includes(query);

          const matchesGrade =
            filters.grade === "All Grades" || item.grade === filters.grade;

          const matchesCategory =
            filters.category === "All Categories" ||
            item.category === filters.category;

          const matchesOrigin =
            filters.origin === "All Origins" || item.origin === filters.origin;

          const matchesStatus =
            filters.status === "Status: Any" || item.status === filters.status;

          return (
            matchesSearch &&
            matchesGrade &&
            matchesCategory &&
            matchesOrigin &&
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

        const reserved = 0;
        const origins = new Set(filtered.map((item) => item.origin)).size;

        return {
          totalInventory: Math.round(totalInventory),
          available: Math.round(available),
          reserved,
          origins,
          lowStock,
          outOfStock,
          unit: "MT",
        };
      },
    }),
    { name: "inventory-store" },
  ),
);
