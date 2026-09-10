import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { defaultProductForm, sellerProductsMock } from "@/lib/mock/products";
import { stockAdjustmentsMock } from "@/lib/mock/stock-adjustments";
import type {
  ProductFormValues,
  SellerProduct,
  StockAdjustment,
} from "@/types/seller";

interface SellerProductState {
  products: SellerProduct[];
  adjustments: StockAdjustment[];
  search: string;
  category: string;
  offerStatus: string;
  page: number;
  pageSize: number;
  loading: boolean;
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
      products: sellerProductsMock,
      adjustments: stockAdjustmentsMock,
      search: "",
      category: "all",
      offerStatus: "all",
      page: 1,
      pageSize: 10,
      loading: false,
      selectedProductId: null,
      stockDrawerOpen: false,
      setSearch: (search) => set({ search, page: 1 }),
      setCategory: (category) => set({ category, page: 1 }),
      setOfferStatus: (offerStatus) => set({ offerStatus, page: 1 }),
      setPage: (page) => set({ page }),
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
