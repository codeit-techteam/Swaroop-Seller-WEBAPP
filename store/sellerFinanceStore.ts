import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  sellerDocumentsMock,
  sellerPaymentsMock,
  sellerSettlementsMock,
} from "@/lib/mock/settlements";
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
      settlements: sellerSettlementsMock,
      payments: sellerPaymentsMock,
      documents: sellerDocumentsMock,
      search: "",
      status: "all",
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
