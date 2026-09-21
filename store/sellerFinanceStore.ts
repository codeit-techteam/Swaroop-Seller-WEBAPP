import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  fetchSellerDocuments,
  fetchSellerPayments,
  fetchSellerSettlements,
} from "@/services/commerce";
import type {
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
  loadError: string | null;
  hydrateDocuments: () => Promise<void>;
  selectedSettlementId: string | null;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  openSettlement: (id: string) => void;
  closeSettlement: () => void;
  uploadDocument: (
    doc: Omit<SellerDocumentRecord, "id" | "uploadedAt">,
  ) => void;
  replaceDocument: (id: string, fileName: string) => void;
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
            loadError: error instanceof Error ? error.message : "Unable to load finance data.",
          });
        }
      },
      selectedSettlementId: null,
      setSearch: (search) => set({ search }),
      setStatus: (status) => set({ status }),
      openSettlement: (id) => set({ selectedSettlementId: id }),
      closeSettlement: () => set({ selectedSettlementId: null }),
      uploadDocument: (doc) =>
        set((state) => ({
          documents: [
            {
              ...doc,
              id: `doc-${Date.now()}`,
              uploadedAt: new Date().toISOString(),
              version: 1,
            },
            ...state.documents,
          ],
        })),
      replaceDocument: (id, fileName) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  fileName,
                  uploadedAt: new Date().toISOString(),
                  status: "pending_verification",
                  version: (doc.version ?? 1) + 1,
                }
              : doc,
          ),
        })),
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
