import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  computePriceRevisionSummary,
  priceRevisionRequestsMock,
} from "@/mock/price-revision";
import type {
  CounterOfferDraft,
  PriceRevisionDialogType,
  PriceRevisionFilters,
  PriceRevisionRequest,
  PriceRevisionSort,
  PriceRevisionSortKey,
  PriceRevisionSummary,
  RejectReason,
  SubmittedCounterOffer,
} from "@/types/price-revision";
import {
  buildTimelineForStatus,
  defaultCounterOfferDraft,
} from "@/types/price-revision";

interface PriceRevisionState {
  requests: PriceRevisionRequest[];
  selectedRequest: PriceRevisionRequest | null;
  drawerOpen: boolean;
  filters: PriceRevisionFilters;
  sort: PriceRevisionSort;
  page: number;
  pageSize: number;
  loading: boolean;
  drawerLoading: boolean;
  dialogType: PriceRevisionDialogType;
  dialogRequestId: string | null;
  draftCounterOffer: Record<string, CounterOfferDraft>;
  rejectReason: RejectReason | "";
  rejectRemark: string;
  counterForm: CounterOfferDraft;

  bootstrap: () => void;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof PriceRevisionFilters>(
    key: K,
    value: PriceRevisionFilters[K],
  ) => void;
  resetFilters: () => void;
  setSort: (key: PriceRevisionSortKey) => void;
  setPage: (page: number) => void;
  openDrawer: (request: PriceRevisionRequest) => void;
  closeDrawer: () => void;
  openDialog: (
    type: Exclude<PriceRevisionDialogType, null>,
    requestId: string,
  ) => void;
  closeDialog: () => void;
  setCounterForm: (data: Partial<CounterOfferDraft>) => void;
  resetCounterForm: () => void;
  setRejectReason: (reason: RejectReason | "") => void;
  setRejectRemark: (remark: string) => void;
  markViewed: (requestId: string) => void;
  acceptRevision: (requestId: string) => void;
  submitCounterOffer: (
    requestId: string,
    offer: Omit<SubmittedCounterOffer, "submittedAt">,
  ) => void;
  saveDraft: (requestId: string) => void;
  rejectRevision: (
    requestId: string,
    reason: RejectReason,
    remark?: string,
  ) => void;
  exportCsv: () => void;
  exportPdf: () => void;
  getFilteredRequests: () => PriceRevisionRequest[];
  getSortedRequests: () => PriceRevisionRequest[];
  getPaginatedRequests: () => PriceRevisionRequest[];
  getComputedSummary: () => PriceRevisionSummary;
  getRequestById: (id: string) => PriceRevisionRequest | undefined;
  hasActiveFilters: () => boolean;
  getDraftForRequest: (requestId: string) => CounterOfferDraft | undefined;
}

const defaultFilters: PriceRevisionFilters = {
  search: "",
  status: "All Statuses",
  productGrade: "All Grades",
  warehouse: "All Warehouses",
  dateFrom: "",
  dateTo: "",
};

const defaultSort: PriceRevisionSort = {
  key: "deadline",
  direction: "asc",
};

function syncSelected(
  requests: PriceRevisionRequest[],
  selected: PriceRevisionRequest | null,
): PriceRevisionRequest | null {
  if (!selected) return null;
  return requests.find((r) => r.id === selected.id) ?? null;
}

function matchesSearch(request: PriceRevisionRequest, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    request.requestId.toLowerCase().includes(q) ||
    request.productGrade.toLowerCase().includes(q) ||
    request.productName.toLowerCase().includes(q) ||
    request.warehouse.toLowerCase().includes(q) ||
    request.warehouseLabel.toLowerCase().includes(q) ||
    request.batchNumber.toLowerCase().includes(q)
  );
}

function matchesFilters(
  request: PriceRevisionRequest,
  filters: PriceRevisionFilters,
): boolean {
  if (filters.status !== "All Statuses" && request.status !== filters.status) {
    return false;
  }
  if (
    filters.productGrade !== "All Grades" &&
    request.productGrade !== filters.productGrade
  ) {
    return false;
  }
  if (
    filters.warehouse !== "All Warehouses" &&
    request.warehouse !== filters.warehouse
  ) {
    return false;
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    const received = new Date(request.receivedAt).getTime();
    if (received < from) return false;
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    const received = new Date(request.receivedAt).getTime();
    if (received > to) return false;
  }
  return matchesSearch(request, filters.search);
}

function compareRequests(
  a: PriceRevisionRequest,
  b: PriceRevisionRequest,
  sort: PriceRevisionSort,
): number {
  const dir = sort.direction === "asc" ? 1 : -1;
  const key = sort.key;

  if (key === "deadline") {
    return (
      (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) * dir
    );
  }

  if (key === "currentPrice" || key === "suggestedPrice") {
    return (a[key] - b[key]) * dir;
  }

  if (key === "status") {
    return a.status.localeCompare(b.status) * dir;
  }

  const aVal = a[key];
  const bVal = b[key];
  return String(aVal).localeCompare(String(bVal)) * dir;
}

function updateRequest(
  requests: PriceRevisionRequest[],
  requestId: string,
  updater: (request: PriceRevisionRequest) => PriceRevisionRequest,
): PriceRevisionRequest[] {
  return requests.map((r) => (r.id === requestId ? updater(r) : r));
}

export const usePriceRevisionStore = create<PriceRevisionState>()(
  devtools(
    persist(
      (set, get) => ({
        requests: priceRevisionRequestsMock,
        selectedRequest: null,
        drawerOpen: false,
        filters: defaultFilters,
        sort: defaultSort,
        page: 1,
        pageSize: 4,
        loading: false,
        drawerLoading: false,
        dialogType: null,
        dialogRequestId: null,
        draftCounterOffer: {},
        rejectReason: "",
        rejectRemark: "",
        counterForm: defaultCounterOfferDraft,

        bootstrap: () => {
          set({ loading: true });
          setTimeout(() => {
            set({
              loading: false,
              requests: priceRevisionRequestsMock.map((r) => ({ ...r })),
            });
          }, 600);
        },

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

        setPage: (page) => set({ page }),

        openDrawer: (request) => {
          const draft = get().draftCounterOffer[request.id];
          set({
            selectedRequest: request,
            drawerOpen: true,
            counterForm: draft ?? {
              ...defaultCounterOfferDraft,
              moq: String(request.moq),
            },
          });
          get().markViewed(request.id);
        },

        closeDrawer: () =>
          set({
            drawerOpen: false,
            selectedRequest: null,
            counterForm: defaultCounterOfferDraft,
          }),

        openDialog: (type, requestId) => {
          const request = get().requests.find((r) => r.id === requestId);
          set({
            dialogType: type,
            dialogRequestId: requestId,
            rejectReason: "",
            rejectRemark: "",
          });
          if (
            request &&
            (type === "accept" || type === "counter" || type === "reject")
          ) {
            set({
              selectedRequest: request,
              drawerOpen: true,
            });
          }
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

        resetCounterForm: () => set({ counterForm: defaultCounterOfferDraft }),

        setRejectReason: (reason) => set({ rejectReason: reason }),

        setRejectRemark: (remark) => set({ rejectRemark: remark }),

        markViewed: (requestId) => {
          const now = new Date().toISOString();
          set((state) => {
            const requests = updateRequest(state.requests, requestId, (r) => {
              if (r.viewedAt) return r;
              const viewedAt = now;
              return {
                ...r,
                viewedAt,
                timeline: buildTimelineForStatus(r.status, {
                  createdAt: r.createdAt,
                  viewedAt,
                  counterSubmittedAt: r.counterOffer?.submittedAt,
                  adminReviewedAt: undefined,
                  acceptedAt: r.acceptedAt,
                  rejectedAt: r.rejectReason ? r.updatedAt : undefined,
                }),
                updatedAt: now,
              };
            });
            return {
              requests,
              selectedRequest: syncSelected(requests, state.selectedRequest),
            };
          });
        },

        acceptRevision: (requestId) => {
          const now = new Date().toISOString();
          set((state) => {
            const requests = updateRequest(state.requests, requestId, (r) => ({
              ...r,
              status: "accepted" as const,
              acceptedAt: now,
              updatedAt: now,
              timeline: buildTimelineForStatus("accepted", {
                createdAt: r.createdAt,
                viewedAt: r.viewedAt ?? now,
                counterSubmittedAt: r.counterOffer?.submittedAt,
                adminReviewedAt: now,
                acceptedAt: now,
              }),
            }));
            return {
              requests,
              selectedRequest: syncSelected(requests, state.selectedRequest),
              dialogType: null,
              dialogRequestId: null,
            };
          });
        },

        submitCounterOffer: (requestId, offer) => {
          const now = new Date().toISOString();
          set((state) => {
            const { [requestId]: _, ...remainingDrafts } =
              state.draftCounterOffer;
            const requests = updateRequest(state.requests, requestId, (r) => ({
              ...r,
              status: "countered" as const,
              counterOffer: { ...offer, submittedAt: now },
              draftCounterOffer: undefined,
              updatedAt: now,
              timeline: buildTimelineForStatus("countered", {
                createdAt: r.createdAt,
                viewedAt: r.viewedAt ?? now,
                counterSubmittedAt: now,
              }),
            }));
            return {
              requests,
              selectedRequest: syncSelected(requests, state.selectedRequest),
              draftCounterOffer: remainingDrafts,
              counterForm: defaultCounterOfferDraft,
              dialogType: null,
              dialogRequestId: null,
            };
          });
        },

        saveDraft: (requestId) => {
          const form = get().counterForm;
          set((state) => {
            const requests = updateRequest(state.requests, requestId, (r) => ({
              ...r,
              draftCounterOffer: { ...form },
              updatedAt: new Date().toISOString(),
            }));
            return {
              requests,
              selectedRequest: syncSelected(requests, state.selectedRequest),
              draftCounterOffer: {
                ...state.draftCounterOffer,
                [requestId]: { ...form },
              },
              dialogType: null,
              dialogRequestId: null,
            };
          });
        },

        rejectRevision: (requestId, reason, remark) => {
          const now = new Date().toISOString();
          set((state) => {
            const requests = updateRequest(state.requests, requestId, (r) => ({
              ...r,
              status: "rejected" as const,
              rejectReason: remark ? `${reason}: ${remark}` : reason,
              updatedAt: now,
              timeline: buildTimelineForStatus("rejected", {
                createdAt: r.createdAt,
                viewedAt: r.viewedAt ?? now,
                rejectedAt: now,
              }),
            }));
            return {
              requests,
              selectedRequest: syncSelected(requests, state.selectedRequest),
              dialogType: null,
              dialogRequestId: null,
              rejectReason: "",
              rejectRemark: "",
            };
          });
        },

        exportCsv: () => {
          const requests = get().getFilteredRequests();
          const headers = [
            "Request ID",
            "Product Grade",
            "Batch",
            "Current Price",
            "Suggested Price",
            "Reason",
            "Warehouse",
            "Deadline",
            "Status",
          ];
          const rows = requests.map((r) =>
            [
              r.requestId,
              `"${r.productGrade}"`,
              r.batchNumber,
              r.currentPrice,
              r.suggestedPrice,
              `"${r.reason}"`,
              r.warehouse,
              r.deadline,
              r.status,
            ].join(","),
          );
          const csv = [headers.join(","), ...rows].join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `price-revisions-${Date.now()}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        },

        exportPdf: () => {
          const requests = get().getFilteredRequests();
          const lines = requests
            .slice(0, 20)
            .map(
              (r) =>
                `${r.requestId} | ${r.productGrade} | ${r.currentPrice} -> ${r.suggestedPrice} | ${r.status}`,
            )
            .join("\\n");
          const content = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 120 >>stream
BT /F1 12 Tf 72 720 Td (Price Revision Report) Tj 0 -20 Td (${lines.slice(0, 80)}) Tj ET
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
          link.download = `price-revisions-${Date.now()}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
        },

        getFilteredRequests: () => {
          const { requests, filters } = get();
          return requests.filter((r) => matchesFilters(r, filters));
        },

        getSortedRequests: () => {
          const filtered = get().getFilteredRequests();
          const { sort } = get();
          return [...filtered].sort((a, b) => compareRequests(a, b, sort));
        },

        getPaginatedRequests: () => {
          const { page, pageSize } = get();
          const sorted = get().getSortedRequests();
          const start = (page - 1) * pageSize;
          return sorted.slice(start, start + pageSize);
        },

        getComputedSummary: () => computePriceRevisionSummary(get().requests),

        getRequestById: (id) => get().requests.find((r) => r.id === id),

        hasActiveFilters: () => {
          const { filters } = get();
          return (
            Boolean(filters.search.trim()) ||
            filters.status !== "All Statuses" ||
            filters.productGrade !== "All Grades" ||
            filters.warehouse !== "All Warehouses" ||
            Boolean(filters.dateFrom) ||
            Boolean(filters.dateTo)
          );
        },

        getDraftForRequest: (requestId) => get().draftCounterOffer[requestId],
      }),
      {
        name: "price-revision-drafts",
        partialize: (state) => ({
          draftCounterOffer: state.draftCounterOffer,
        }),
      },
    ),
    { name: "price-revision-store" },
  ),
);

export { defaultFilters, defaultSort };
