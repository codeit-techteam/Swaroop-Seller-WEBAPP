import { isAxiosError } from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { defaultProductForm } from "@/lib/mock/products";
import { adjustSellerInventory, fetchSellerProducts } from "@/services/catalog";
import { useLocationStore } from "@/store/locationStore";
import type {
  ProductFormValues,
  SellerProduct,
  StockAdjustment,
} from "@/types/seller";

function withActiveLocation(products: SellerProduct[]): SellerProduct[] {
  const locationId = useLocationStore.getState().selectedLocationId;
  return products.map((product) =>
    !product.locationId || product.locationId === "loc-default"
      ? { ...product, locationId }
      : product,
  );
}
function catalogErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
  }
  if (error instanceof Error) return error.message;
  return "Unable to load seller catalog.";
}

interface SellerProductState {
  products: SellerProduct[];
  adjustments: StockAdjustment[];
  search: string;
  category: string;
  offerStatus: string;
  page: number;
  pageSize: number;
  loading: boolean;
  loadError: string | null;
  fetchProducts: () => Promise<void>;
  selectedProductId: string | null;
  stockDrawerOpen: boolean;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setOfferStatus: (status: string) => void;
  setPage: (page: number) => void;
  addProduct: (values: ProductFormValues, asDraft?: boolean) => SellerProduct;
  updateProduct: (id: string, data: Partial<SellerProduct>) => void;
  adjustStock: (
    id: string,
    delta: number,
    reason: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  openStockDrawer: (id: string) => void;
  closeStockDrawer: () => void;
  getFiltered: (locationId?: string) => SellerProduct[];
  getById: (id: string) => SellerProduct | undefined;
}

export const useSellerProductStore = create<SellerProductState>()(
  devtools(
    (set, get) => ({
      products: [],
      adjustments: [],
      search: "",
      category: "all",
      offerStatus: "all",
      page: 1,
      pageSize: 10,
      loading: true,
      loadError: null,
      selectedProductId: null,
      stockDrawerOpen: false,
      setSearch: (search) => set({ search, page: 1 }),
      setCategory: (category) => set({ category, page: 1 }),
      setOfferStatus: (offerStatus) => set({ offerStatus, page: 1 }),
      setPage: (page) => set({ page }),
      fetchProducts: async () => {
        set({ loading: true, loadError: null });
        try {
          const products = withActiveLocation(await fetchSellerProducts());
          set({ products, loading: false, loadError: null });
        } catch (error) {
          set({
            products: [],
            loading: false,
            loadError: catalogErrorMessage(error),
          });
        }
      },
      addProduct: (values, asDraft = false) => {
        const now = new Date().toISOString();
        const product: SellerProduct = {
          id: `prod-${Date.now()}`,
          ...values,
          reservedStock: values.reservedStock ?? 0,
          committedStock: 0,
          offerStatus: asDraft ? "draft" : "none",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ products: [product, ...state.products] }));
        return product;
      },
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...data, updatedAt: new Date().toISOString() }
              : product,
          ),
        })),
      adjustStock: async (id, delta, reason) => {
        const product = get().products.find((item) => item.id === id);
        if (!product) {
          return { ok: false, message: "Product not found" };
        }
        if (!product.inventoryId) {
          return {
            ok: false,
            message:
              "No inventory linked. Open Edit and set Available Stock to sync inventory.",
          };
        }
        try {
          await adjustSellerInventory({
            inventoryId: product.inventoryId,
            quantityDelta: delta,
            notes: reason,
          });
          set((state) => ({
            products: state.products.map((item) =>
              item.id === id
                ? {
                    ...item,
                    availableStock: Math.max(0, item.availableStock + delta),
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
            adjustments: [
              {
                id: `adj-${Date.now()}`,
                productId: id,
                delta,
                reason,
                at: new Date().toISOString(),
              },
              ...state.adjustments,
            ],
          }));
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "Unable to adjust stock on backend.",
          };
        }
      },
      openStockDrawer: (id) =>
        set({ selectedProductId: id, stockDrawerOpen: true }),
      closeStockDrawer: () =>
        set({ stockDrawerOpen: false, selectedProductId: null }),
      getFiltered: (locationId) => {
        const { products, search, category, offerStatus } = get();
        const query = search.trim().toLowerCase();
        return products.filter((product) => {
          if (locationId && product.locationId !== locationId) return false;
          if (category !== "all" && product.category !== category) return false;
          if (offerStatus !== "all" && product.offerStatus !== offerStatus) {
            return false;
          }
          if (!query) return true;
          return (
            product.gradeName.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.manufacturer.toLowerCase().includes(query)
          );
        });
      },
      getById: (id) => get().products.find((product) => product.id === id),
    }),
    { name: "seller-product-store" },
  ),
);

export { defaultProductForm };
