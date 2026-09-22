import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { isAxiosError } from "axios";

import { defaultProductForm } from "@/lib/mock/products";
import { stockAdjustmentsMock } from "@/lib/mock/stock-adjustments";
import { fetchSellerProducts } from "@/services/catalog";
import { useAuthStore } from "@/store/authStore";
import type {
  ProductFormValues,
  SellerProduct,
  StockAdjustment,
} from "@/types/seller";

function isMissingSellerProfile(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (error.response?.status !== 404) return false;
  const message = error.response?.data?.message;
  return (
    typeof message === "string" &&
    message.toLowerCase().includes("seller profile")
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
  adjustStock: (id: string, delta: number, reason: string) => void;
  openStockDrawer: (id: string) => void;
  closeStockDrawer: () => void;
  getFiltered: (locationId?: string) => SellerProduct[];
  getById: (id: string) => SellerProduct | undefined;
}

export const useSellerProductStore = create<SellerProductState>()(
  devtools(
    (set, get) => ({
      products: [],
      adjustments: stockAdjustmentsMock,
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
          let products = await fetchSellerProducts();
          set({ products, loading: false, loadError: null });
        } catch (error) {
          if (isMissingSellerProfile(error)) {
            const restored = await useAuthStore
              .getState()
              .ensureDemoSellerSession();
            if (restored.ok) {
              try {
                const products = await fetchSellerProducts();
                set({ products, loading: false, loadError: null });
                return;
              } catch (retryError) {
                set({
                  products: [],
                  loading: false,
                  loadError: catalogErrorMessage(retryError),
                });
                return;
              }
            }
          }
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
      adjustStock: (id, delta, reason) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  availableStock: Math.max(0, product.availableStock + delta),
                  updatedAt: new Date().toISOString(),
                }
              : product,
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
        })),
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
