import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  computeOfferReviewSummary,
  offerReviewsMock,
  offerReviewSummaryMock,
} from "@/mock/offer-review";
import type {
  OfferReview,
  OfferReviewDialogType,
  OfferReviewFilters,
  OfferReviewSort,
  OfferReviewSummary,
  OfferReviewSummaryKey,
  OfferReviewTimelineStep,
} from "@/types/offer-review";

interface OfferReviewState {
  offers: OfferReview[];
  selectedOffer: OfferReview | null;
  drawerOpen: boolean;
  filters: OfferReviewFilters;
  sort: OfferReviewSort;
  page: number;
  pageSize: number;
  summary: OfferReviewSummary;
  loading: boolean;
  drawerLoading: boolean;
  dialogType: OfferReviewDialogType;
  dialogOfferId: string | null;
  successMessage: string;
  moreFiltersOpen: boolean;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof OfferReviewFilters>(
    key: K,
    value: OfferReviewFilters[K],
  ) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSort: (key: OfferReviewSort["key"]) => void;
  openDrawer: (offer: OfferReview) => void;
  openDrawerById: (offerId: string) => boolean;
  closeDrawer: () => void;
  openDialog: (
    type: Exclude<OfferReviewDialogType, null>,
    offerId?: string,
  ) => void;
  closeDialog: () => void;
  setMoreFiltersOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  resubmitOffer: (offerId: string) => void;
  withdrawOffer: (offerId: string, reason: string) => void;
  duplicateOffer: (offerId: string) => OfferReview | null;
  downloadDocument: (offerId: string, documentId: string) => void;
  getFilteredOffers: () => OfferReview[];
  getPaginatedOffers: () => OfferReview[];
  getComputedSummary: () => OfferReviewSummary;
  applySummaryFilter: (key: OfferReviewSummaryKey) => void;
}

const defaultFilters: OfferReviewFilters = {
  search: "",
  status: "all",
  productGrade: "all",
  warehouse: "all",
  dateFrom: "",
  dateTo: "",
  minQuantity: "",
  maxQuantity: "",
};

function buildResubmitTimeline(
  existing: OfferReviewTimelineStep[],
): OfferReviewTimelineStep[] {
  const now = new Date().toISOString();
  const completed = existing.map((step) => ({
    ...step,
    status: step.status === "current" ? ("completed" as const) : step.status,
  }));

  return [
    ...completed.filter((s) => s.stage !== "changes_requested"),
    {
      id: `tl-resubmit-${Date.now()}`,
      stage: "submitted" as const,
      title: "Re-submitted",
      timestamp: now,
      status: "completed" as const,
    },
    {
      id: `tl-pending-${Date.now()}`,
      stage: "review_started" as const,
      title: "Review Started",
      description: "AWAITING ASSIGNMENT",
      status: "current" as const,
    },
  ];
}

export const useOfferReviewStore = create<OfferReviewState>()(
  devtools(
    (set, get) => ({
      offers: offerReviewsMock,
      selectedOffer: null,
      drawerOpen: false,
      filters: defaultFilters,
      sort: { key: "submittedAt", direction: "desc" },
      page: 1,
      pageSize: 10,
      summary: offerReviewSummaryMock,
      loading: false,
      drawerLoading: false,
      dialogType: null,
      dialogOfferId: null,
      successMessage: "",
      moreFiltersOpen: false,

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

      resetFilters: () =>
        set({ filters: defaultFilters, page: 1, moreFiltersOpen: false }),

      setPage: (page) => set({ page }),

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

      openDrawer: (offer) => {
        set({ selectedOffer: offer, drawerOpen: true, drawerLoading: true });
        window.setTimeout(() => {
          set({ drawerLoading: false });
        }, 280);
      },

      openDrawerById: (offerId) => {
        const offer = get().offers.find(
          (item) => item.id === offerId || item.offerId === offerId,
        );
        if (!offer) return false;
        get().openDrawer(offer);
        return true;
      },

      closeDrawer: () =>
        set({ selectedOffer: null, drawerOpen: false, drawerLoading: false }),

      openDialog: (type, offerId) =>
        set({
          dialogType: type,
          dialogOfferId: offerId ?? get().selectedOffer?.id ?? null,
        }),

      closeDialog: () =>
        set({
          dialogType: null,
          dialogOfferId: null,
          successMessage: "",
        }),

      setMoreFiltersOpen: (open) => set({ moreFiltersOpen: open }),

      setLoading: (loading) => set({ loading }),

      resubmitOffer: (offerId) => {
        const now = new Date().toISOString();
        set((state) => {
          const offers = state.offers.map((offer) => {
            if (offer.id !== offerId) return offer;
            const nextVersion = offer.versionHistory.length + 1;
            return {
              ...offer,
              status: "pending_review" as const,
              submittedAt: now,
              adminFeedback: {
                title: "Review In Progress",
                message:
                  "Your revised offer has been re-submitted and is pending admin review.",
                type: "info" as const,
              },
              requestedChanges: [],
              timeline: buildResubmitTimeline(offer.timeline),
              versionHistory: [
                ...offer.versionHistory.map((v) => ({
                  ...v,
                  isLatest: false,
                })),
                {
                  id: `v${nextVersion}`,
                  version: nextVersion,
                  label: "Re-submitted",
                  timestamp: now,
                  isLatest: true,
                },
              ],
            };
          });

          const selected = offers.find((o) => o.id === offerId) ?? null;
          return {
            offers,
            selectedOffer: selected,
            summary: computeOfferReviewSummary(offers),
            dialogType: "success" as const,
            successMessage:
              "Offer re-submitted successfully. Status updated to Pending Review.",
          };
        });
      },

      withdrawOffer: (offerId, reason) => {
        const now = new Date().toISOString();
        set((state) => {
          const offers = state.offers.map((offer) => {
            if (offer.id !== offerId) return offer;
            return {
              ...offer,
              status: "withdrawn" as const,
              withdrawReason: reason,
              timeline: [
                ...offer.timeline.map((step) => ({
                  ...step,
                  status:
                    step.status === "current"
                      ? ("completed" as const)
                      : step.status,
                })),
                {
                  id: `tl-withdraw-${Date.now()}`,
                  stage: "rejected" as const,
                  title: "Withdrawn by Seller",
                  description: reason.slice(0, 40),
                  timestamp: now,
                  status: "danger" as const,
                },
              ],
            };
          });

          const selected = offers.find((o) => o.id === offerId) ?? null;
          return {
            offers,
            selectedOffer: selected,
            summary: computeOfferReviewSummary(offers),
            dialogType: "success" as const,
            successMessage: "Offer withdrawn successfully.",
          };
        });
      },

      duplicateOffer: (offerId) => {
        const source = get().offers.find((o) => o.id === offerId);
        if (!source) return null;

        const duplicate: OfferReview = {
          ...source,
          id: `or-dup-${Date.now()}`,
          offerId: `PR-${String(Math.floor(Math.random() * 90000) + 10000)}`,
          status: "draft",
          submittedAt: new Date().toISOString(),
          adminFeedback: null,
          requestedChanges: [],
          withdrawReason: undefined,
          timeline: [
            {
              id: `tl-draft-${Date.now()}`,
              stage: "submitted",
              title: "Draft Created",
              timestamp: new Date().toISOString(),
              status: "current",
            },
          ],
          versionHistory: [
            {
              id: "v1",
              version: 1,
              label: "Draft",
              timestamp: new Date().toISOString(),
              isLatest: true,
            },
          ],
        };

        set((state) => ({
          offers: [duplicate, ...state.offers],
          summary: computeOfferReviewSummary([duplicate, ...state.offers]),
        }));

        return duplicate;
      },

      downloadDocument: (_offerId, documentId) => {
        const offer = get().selectedOffer;
        const doc = offer?.documents.find((d) => d.id === documentId);
        if (!doc) return;
        void doc;
      },

      getFilteredOffers: () => {
        const { offers, filters, sort } = get();
        const query = filters.search.trim().toLowerCase();

        const filtered = offers.filter((offer) => {
          const matchesSearch =
            !query ||
            offer.offerId.toLowerCase().includes(query) ||
            offer.productGrade.toLowerCase().includes(query) ||
            offer.warehouse.toLowerCase().includes(query);

          const matchesStatus =
            filters.status === "all" || offer.status === filters.status;

          const matchesGrade =
            filters.productGrade === "all" ||
            offer.productGrade === filters.productGrade;

          const matchesWarehouse =
            filters.warehouse === "all" ||
            offer.warehouse === filters.warehouse;

          const submittedTime = new Date(offer.submittedAt).getTime();
          const matchesFrom =
            !filters.dateFrom ||
            submittedTime >= new Date(filters.dateFrom).getTime();
          const matchesTo =
            !filters.dateTo ||
            submittedTime <= new Date(`${filters.dateTo}T23:59:59`).getTime();

          const minQty = filters.minQuantity
            ? Number(filters.minQuantity)
            : null;
          const maxQty = filters.maxQuantity
            ? Number(filters.maxQuantity)
            : null;
          const matchesMin =
            minQty === null ||
            Number.isNaN(minQty) ||
            offer.quantityMt >= minQty;
          const matchesMax =
            maxQty === null ||
            Number.isNaN(maxQty) ||
            offer.quantityMt <= maxQty;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesGrade &&
            matchesWarehouse &&
            matchesFrom &&
            matchesTo &&
            matchesMin &&
            matchesMax
          );
        });

        return [...filtered].sort((a, b) => {
          const dir = sort.direction === "asc" ? 1 : -1;
          const left = a[sort.key];
          const right = b[sort.key];

          if (sort.key === "submittedAt") {
            return (
              (new Date(String(left)).getTime() -
                new Date(String(right)).getTime()) *
              dir
            );
          }

          if (sort.key === "quantityMt" || sort.key === "basePrice") {
            return (Number(left) - Number(right)) * dir;
          }

          return String(left ?? "").localeCompare(String(right ?? "")) * dir;
        });
      },

      getPaginatedOffers: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredOffers();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getComputedSummary: () =>
        computeOfferReviewSummary(get().getFilteredOffers()),

      applySummaryFilter: (key) => {
        switch (key) {
          case "totalSubmitted":
            get().resetFilters();
            break;
          case "pendingReview":
            get().setFilter("status", "pending_review");
            break;
          case "approved":
            get().setFilter("status", "approved");
            break;
          case "needsChanges":
            get().setFilter("status", "needs_changes");
            break;
          case "rejected":
            get().setFilter("status", "rejected");
            break;
        }
      },
    }),
    { name: "offer-review-store" },
  ),
);
