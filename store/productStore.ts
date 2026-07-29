import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { productsMock } from "@/mock/products";
import type { Product, ProductFormData } from "@/types/products";
import { defaultProductFormData } from "@/types/products";

interface ProductState {
  products: Product[];
  draft: ProductFormData;
  lastSavedAt: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  updateDraft: (data: Partial<ProductFormData>) => void;
  updateUpload: (
    uploadId: string,
    data: Partial<ProductFormData["uploads"][0]>,
  ) => void;
  resetDraft: () => void;
  saveDraft: () => void;
  publishProduct: () => Product | null;
  addInventory: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      products: productsMock,
      draft: defaultProductFormData(),
      lastSavedAt: null,
      isSaving: false,
      isPublishing: false,
      updateDraft: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...data,
            inventory: data.inventory
              ? { ...state.draft.inventory, ...data.inventory }
              : state.draft.inventory,
            pricing: data.pricing
              ? { ...state.draft.pricing, ...data.pricing }
              : state.draft.pricing,
            technicalSpecs: data.technicalSpecs
              ? { ...state.draft.technicalSpecs, ...data.technicalSpecs }
              : state.draft.technicalSpecs,
          },
        })),
      updateUpload: (uploadId, data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            uploads: state.draft.uploads.map((upload) =>
              upload.id === uploadId ? { ...upload, ...data } : upload,
            ),
          },
        })),
      resetDraft: () =>
        set({ draft: defaultProductFormData(), lastSavedAt: null }),
      saveDraft: () => {
        set({ isSaving: true });
        const now = new Date().toISOString();
        set({ lastSavedAt: now, isSaving: false });
      },
      publishProduct: () => {
        const { draft, products } = get();
        const now = new Date().toISOString();
        const newProduct: Product = {
          ...draft,
          id: `prod-${Date.now()}`,
          sku: `SKU-${draft.productGrade.replace(/\s+/g, "-").toUpperCase().slice(0, 12)}`,
          status: "published",
          createdAt: now,
          updatedAt: now,
          lastSavedAt: now,
        };
        set({
          products: [newProduct, ...products],
          draft: defaultProductFormData(),
          lastSavedAt: null,
        });
        return newProduct;
      },
      addInventory: () => {
        set({ lastSavedAt: new Date().toISOString() });
      },
    }),
    { name: "product-store" },
  ),
);
