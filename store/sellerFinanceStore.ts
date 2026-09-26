import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  fetchSellerPayments,
  fetchSellerSettlements,
} from "@/services/commerce";
import {
  fetchSellerDocuments,
  replaceSellerDocument,
  uploadSellerDocument,
} from "@/services/seller-documents";
import type {
  DocumentCategory,
  SellerDocumentRecord,
  SellerPayment,
  SellerSettlement,
} from "@/types/seller";

interface SellerFinanceState {
  settlements: SellerSettlement[];
  payments: SellerPayment[];
  documents: SellerDocumentRecord[];
  search: string;
  status: string;
  documentsLoading: boolean;
  documentsBusy: boolean;
  loadError: string | null;
  hydrateDocuments: () => Promise<void>;
  selectedSettlementId: string | null;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  openSettlement: (id: string) => void;
  closeSettlement: () => void;
  uploadDocument: (input: {
    category: DocumentCategory;
    file: File;
  }) => Promise<SellerDocumentRecord>;
  replaceDocument: (input: {
    id: string;
    file: File;
  }) => Promise<SellerDocumentRecord>;
  getFilteredSettlements: () => SellerSettlement[];
  getFilteredPayments: () => SellerPayment[];
  getFilteredDocuments: () => SellerDocumentRecord[];
}

export const useSellerFinanceStore = create<SellerFinanceState>()(
  devtools(
    (set, get) => ({
      settlements: [],
      payments: [],
      documents: [],
      search: "",
      status: "all",
      documentsLoading: true,
      documentsBusy: false,
      loadError: null,
      hydrateDocuments: async () => {
        set({ documentsLoading: true, loadError: null });
        try {
          const [settlements, payments, documents] = await Promise.all([
            fetchSellerSettlements(),
            fetchSellerPayments(),
            fetchSellerDocuments(),
          ]);
          set({
            settlements,
            payments,
            documents,
            documentsLoading: false,
            loadError: null,
          });
        } catch (error) {
          set({
            settlements: [],
            payments: [],
            documents: [],
            documentsLoading: false,
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to load finance data.",
          });
        }
      },
      selectedSettlementId: null,
      setSearch: (search) => set({ search }),
      setStatus: (status) => set({ status }),
      openSettlement: (id) => set({ selectedSettlementId: id }),
      closeSettlement: () => set({ selectedSettlementId: null }),
      uploadDocument: async ({ category, file }) => {
        set({ documentsBusy: true });
        try {
          const created = await uploadSellerDocument({ category, file });
          set((state) => ({
            documents: [
              created,
              ...state.documents.filter((doc) => doc.id !== created.id),
            ],
            documentsBusy: false,
          }));
          return created;
        } catch (error) {
          set({ documentsBusy: false });
          throw error;
        }
      },
      replaceDocument: async ({ id, file }) => {
        set({ documentsBusy: true });
        try {
          const replaced = await replaceSellerDocument({ id, file });
          set((state) => ({
            documents: state.documents.map((doc) =>
              doc.id === id ? replaced : doc,
            ),
            documentsBusy: false,
          }));
          return replaced;
        } catch (error) {
          set({ documentsBusy: false });
          throw error;
        }
      },
      getFilteredSettlements: () => {
        const { settlements, search, status } = get();
        const query = search.trim().toLowerCase();
        return settlements.filter((item) => {
          if (status !== "all" && item.status !== status) return false;
          if (!query) return true;
          return (
            item.settlementId.toLowerCase().includes(query) ||
            item.orderId.toLowerCase().includes(query)
          );
        });
      },
      getFilteredPayments: () => {
        const { payments, search } = get();
        const query = search.trim().toLowerCase();
        return payments.filter((item) => {
          if (!query) return true;
          return (
            item.paymentId.toLowerCase().includes(query) ||
            item.orderId.toLowerCase().includes(query) ||
            item.reference.toLowerCase().includes(query)
          );
        });
      },
      getFilteredDocuments: () => {
        const { documents, search, status } = get();
        const query = search.trim().toLowerCase();
        return documents.filter((item) => {
          if (
            status !== "all" &&
            item.category !== status &&
            item.status !== status
          ) {
            return false;
          }
          if (!query) return true;
          return (
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
          );
        });
      },
    }),
    { name: "seller-finance-store" },
  ),
);
