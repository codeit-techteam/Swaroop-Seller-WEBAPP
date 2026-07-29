import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  purchaseRequestsMock,
  purchaseRequestSummaryMock,
} from "@/mock/purchase-requests";
import type {
  CounterOffer,
  CounterOfferFormData,
  PurchaseRequest,
  PurchaseRequestFilters,
  PurchaseRequestStatus,
  PurchaseRequestSummary,
  RejectReason,
} from "@/types/purchase-requests";
import { defaultCounterOfferFormData } from "@/types/purchase-requests";

type DialogType =
  "accept" | "reject" | "counter" | "history" | "view_counter" | null;

interface PurchaseRequestState {
  requests: PurchaseRequest[];
  selectedRequest: PurchaseRequest | null;
  filters: PurchaseRequestFilters;
  page: number;
  pageSize: number;
  panelOpen: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
  dialogType: DialogType;
  dialogRequestId: string | null;
  counterForm: CounterOfferFormData;
  rejectReason: RejectReason | "";
  rejectRemark: string;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof PurchaseRequestFilters>(
    key: K,
    value: PurchaseRequestFilters[K],
  ) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  selectRequest: (request: PurchaseRequest) => void;
  closePanel: () => void;
  openDialog: (type: DialogType, requestId: string) => void;
  closeDialog: () => void;
  setCounterForm: (data: Partial<CounterOfferFormData>) => void;
  resetCounterForm: () => void;
  setRejectReason: (reason: RejectReason | "") => void;
  setRejectRemark: (remark: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (
    requestId: string,
    reason: RejectReason,
    remark?: string,
  ) => void;
  submitCounterOffer: (
    requestId: string,
    offer: Omit<CounterOffer, "submittedAt">,
  ) => void;
  refreshData: () => Promise<void>;
  exportCsv: () => void;
  downloadDocument: (
    requestId: string,
    documentId: string,
  ) => Promise<"ok" | "failed">;
  getFilteredRequests: () => PurchaseRequest[];
  getPaginatedRequests: () => PurchaseRequest[];
  getComputedSummary: () => PurchaseRequestSummary;
  getRequestById: (id: string) => PurchaseRequest | undefined;
}

const defaultFilters: PurchaseRequestFilters = {
  search: "",
  status: "All Statuses",
  materialGrade: "All Grades",
  warehouse: "All Warehouses",
  dateFrom: "",
  dateTo: "",
};

function isSameDay(iso: string | undefined, compare = new Date()): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

function computeSummary(requests: PurchaseRequest[]): PurchaseRequestSummary {
  const pending = requests.filter((r) => r.status === "pending");
  const counterSent = requests.filter((r) => r.status === "counter_sent");
  const accepted = requests.filter((r) => r.status === "accepted");

  return {
    newRequests: pending.length,
    awaitingResponse: pending.length + counterSent.length,
    acceptedToday: accepted.filter((r) => isSameDay(r.acceptedAt)).length,
    dispatchPending: accepted.length,
  };
}

export const usePurchaseRequestStore = create<PurchaseRequestState>()(
  devtools(
    (set, get) => ({
      requests: purchaseRequestsMock,
      selectedRequest: null,
      filters: defaultFilters,
      page: 1,
      pageSize: 5,
      panelOpen: false,
      isRefreshing: false,
      isLoading: false,
      dialogType: null,
      dialogRequestId: null,
      counterForm: defaultCounterOfferFormData,
      rejectReason: "",
      rejectRemark: "",

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

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      setPage: (page) => set({ page }),

      selectRequest: (request) =>
        set({ selectedRequest: request, panelOpen: true }),

      closePanel: () => set({ selectedRequest: null, panelOpen: false }),

      openDialog: (type, requestId) => {
        const request = get().requests.find((r) => r.id === requestId);
        set({
          dialogType: type,
          dialogRequestId: requestId,
          selectedRequest: request ?? get().selectedRequest,
          panelOpen: request ? true : get().panelOpen,
          rejectReason: "",
          rejectRemark: "",
          counterForm: request
            ? {
                ...defaultCounterOfferFormData,
                basePrice: String(request.unitPrice),
                moq: String(Math.max(5, Math.round(request.quantityMt * 0.5))),
                availableQuantity: String(request.quantityMt),
                dispatchDate: request.deadline,
              }
            : defaultCounterOfferFormData,
        });
      },

      closeDialog: () =>
        set({
          dialogType: null,
          dialogRequestId: null,
          rejectReason: "",
          rejectRemark: "",
        }),

      setCounterForm: (data) =>
        set((state) => ({
          counterForm: { ...state.counterForm, ...data },
        })),

      resetCounterForm: () => set({ counterForm: defaultCounterOfferFormData }),

      setRejectReason: (reason) => set({ rejectReason: reason }),

      setRejectRemark: (remark) => set({ rejectRemark: remark }),

      acceptRequest: (requestId) => {
        const now = new Date().toISOString();
        const orderId = `ord-${requestId}`;
        set((state) => {
          const requests = state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: "accepted" as PurchaseRequestStatus,
                  orderId,
                  acceptedAt: now,
                  updatedAt: now,
                }
              : r,
          );
          const selected =
            state.selectedRequest?.id === requestId
              ? (requests.find((r) => r.id === requestId) ?? null)
              : state.selectedRequest;
          return {
            requests,
            selectedRequest: selected,
            dialogType: null,
            dialogRequestId: null,
          };
        });
      },

      rejectRequest: (requestId, reason, remark) => {
        const now = new Date().toISOString();
        set((state) => {
          const requests = state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: "rejected" as PurchaseRequestStatus,
                  rejectReason: reason,
                  rejectRemark: remark,
                  updatedAt: now,
                }
              : r,
          );
          const selected =
            state.selectedRequest?.id === requestId
              ? (requests.find((r) => r.id === requestId) ?? null)
              : state.selectedRequest;
          return {
            requests,
            selectedRequest: selected,
            dialogType: null,
            dialogRequestId: null,
            rejectReason: "",
            rejectRemark: "",
          };
        });
      },

      submitCounterOffer: (requestId, offer) => {
        const now = new Date().toISOString();
        set((state) => {
          const requests = state.requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: "counter_sent" as PurchaseRequestStatus,
                  counterOffer: { ...offer, submittedAt: now },
                  updatedAt: now,
                }
              : r,
          );
          const selected =
            state.selectedRequest?.id === requestId
              ? (requests.find((r) => r.id === requestId) ?? null)
              : state.selectedRequest;
          return {
            requests,
            selectedRequest: selected,
            dialogType: null,
            dialogRequestId: null,
            counterForm: defaultCounterOfferFormData,
          };
        });
      },

      refreshData: async () => {
        set({ isRefreshing: true });
        await new Promise((resolve) => setTimeout(resolve, 900));
        const next = purchaseRequestsMock.map((r) => ({ ...r }));
        const selectedId = get().selectedRequest?.id;
        set({
          requests: next,
          isRefreshing: false,
          page: 1,
          selectedRequest: selectedId
            ? (next.find((r) => r.id === selectedId) ?? null)
            : null,
        });
      },

      exportCsv: () => {
        const requests = get().getFilteredRequests();
        const headers = [
          "Request ID",
          "Product",
          "Product Grade",
          "Material",
          "Quantity (MT)",
          "Unit Price",
          "Warehouse",
          "Deadline",
          "Status",
          "Urgency",
        ];
        const rows = requests.map((r) =>
          [
            r.requestNumber,
            `"${r.productName}"`,
            r.productGrade,
            r.materialCategory,
            r.quantityMt.toFixed(2),
            r.unitPrice.toFixed(2),
            r.warehouse,
            r.deadline,
            r.status,
            r.urgency,
          ].join(","),
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `purchase-requests-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },

      downloadDocument: async (requestId, documentId) => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        // Simulate occasional network failure (~12%)
        if (Math.random() < 0.12) return "failed";

        const request = get().requests.find((r) => r.id === requestId);
        const doc = request?.documents.find((d) => d.id === documentId);
        if (!doc) return "failed";

        const content = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 68 >>stream
BT /F1 18 Tf 72 720 Td (${doc.name}) Tj ET
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
trailer<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;
        const blob = new Blob([content], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.name;
        link.click();
        URL.revokeObjectURL(url);
        return "ok";
      },

      getFilteredRequests: () => {
        const { requests, filters } = get();
        const query = filters.search.trim().toLowerCase();

        return requests.filter((item) => {
          const matchesSearch =
            !query ||
            item.requestNumber.toLowerCase().includes(query) ||
            item.productGrade.toLowerCase().includes(query) ||
            item.productName.toLowerCase().includes(query) ||
            item.warehouse.toLowerCase().includes(query) ||
            item.warehouseLabel.toLowerCase().includes(query);

          const matchesStatus =
            filters.status === "All Statuses" || item.status === filters.status;

          const matchesMaterial =
            filters.materialGrade === "All Grades" ||
            item.materialCategory === filters.materialGrade;

          const matchesWarehouse =
            filters.warehouse === "All Warehouses" ||
            item.warehouse === filters.warehouse;

          const deadline = new Date(item.deadline).getTime();
          const matchesFrom =
            !filters.dateFrom ||
            deadline >= new Date(filters.dateFrom).getTime();
          const matchesTo =
            !filters.dateTo || deadline <= new Date(filters.dateTo).getTime();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMaterial &&
            matchesWarehouse &&
            matchesFrom &&
            matchesTo
          );
        });
      },

      getPaginatedRequests: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredRequests();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getComputedSummary: () => computeSummary(get().requests),

      getRequestById: (id) => get().requests.find((r) => r.id === id),
    }),
    { name: "purchase-request-store" },
  ),
);

export { computeSummary, defaultFilters, purchaseRequestSummaryMock };
