import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { offersMock, offersSummaryMock } from "@/mock/offers";
import type {
  Offer,
  OfferFilters,
  OfferFormData,
  OfferSortBy,
  OfferSummary,
  OfferTab,
  PricingTier,
} from "@/types/offers";
import { defaultOfferFormData } from "@/types/offers";

interface OfferState {
  offers: Offer[];
  summary: OfferSummary;
  filters: OfferFilters;
  page: number;
  pageSize: number;
  isSyncing: boolean;
  isLoading: boolean;
  isActivating: boolean;
  formData: OfferFormData;
  editingOfferId: string | null;
  previewOpen: boolean;
  previewOffer: Offer | null;
  confirmDialog: {
    open: boolean;
    type: "pause" | "resume" | "delete" | "duplicate" | "activate" | null;
    offerId: string | null;
  };
  setSearch: (search: string) => void;
  setTab: (tab: OfferTab) => void;
  setFilters: (filters: Partial<OfferFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: OfferSortBy) => void;
  toggleVisibility: (offerId: string) => void;
  pauseOffer: (offerId: string) => void;
  resumeOffer: (offerId: string) => void;
  deleteOffer: (offerId: string) => void;
  duplicateOffer: (offerId: string) => Offer | null;
  syncData: () => Promise<void>;
  exportCsv: () => void;
  openConfirmDialog: (
    type: OfferState["confirmDialog"]["type"],
    offerId: string,
  ) => void;
  closeConfirmDialog: () => void;
  getFilteredOffers: () => Offer[];
  getPaginatedOffers: () => Offer[];
  getComputedSummary: () => OfferSummary;
  getOfferById: (id: string) => Offer | undefined;
  setFormData: (data: Partial<OfferFormData>) => void;
  resetFormData: () => void;
  loadOfferForEdit: (offerId: string) => void;
  updateTiers: (tiers: PricingTier[]) => void;
  recalculateTiers: (basePrice: number) => void;
  addTier: () => void;
  duplicateTier: (tierId: string) => void;
  removeTier: (tierId: string) => void;
  updateTier: (tierId: string, data: Partial<PricingTier>) => void;
  reorderTiers: (fromIndex: number, toIndex: number) => void;
  saveDraft: () => Offer;
  activateOffer: () => Promise<Offer | null>;
  setPreviewOpen: (open: boolean, offer?: Offer | null) => void;
  setIsActivating: (value: boolean) => void;
}

const defaultFilters: OfferFilters = {
  search: "",
  tab: "all",
  warehouse: "All Warehouses",
  category: "All Categories",
  status: "All Statuses",
  paymentTerm: "All Payment Terms",
  validityFrom: "",
  validityTo: "",
  priceMin: "",
  priceMax: "",
  moqMin: "",
  moqMax: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "newest",
};

function recalcTier(tier: PricingTier, basePrice: number): PricingTier {
  const clampedDiscount = Math.min(Math.max(tier.discountPercent, 0), 100);
  const unitPrice = basePrice * (1 - clampedDiscount / 100);
  return {
    ...tier,
    discountPercent: clampedDiscount,
    unitPrice: Math.round(unitPrice * 100) / 100,
    savingsPerMt: Math.round((basePrice - unitPrice) * 100) / 100,
  };
}

function generateOfferId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 3; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `OFF-2026-${suffix}`;
}

function buildOfferFromForm(
  formData: OfferFormData,
  editingOfferId: string | null,
  existing?: Offer,
): Offer {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? editingOfferId ?? `offer-${Date.now()}`,
    offerId: existing?.offerId ?? generateOfferId(),
    productId: formData.productId,
    productName: formData.productName,
    productGrade: formData.productGrade,
    productSubtext: formData.productSubtext || existing?.productSubtext || "",
    category: formData.category || existing?.category || "",
    warehouseId: formData.warehouseId,
    warehouseName: formData.warehouseName,
    basePrice: formData.basePrice,
    quantityMt: formData.allocationMt,
    moq: formData.moq,
    allocationMt: formData.allocationMt,
    availableInventoryMt: formData.availableInventoryMt,
    visibility: existing?.visibility ?? false,
    status: existing?.status ?? "draft",
    validUntil: formData.validUntil,
    paymentTerms: formData.paymentTerms,
    remarks: formData.remarks,
    tiers: formData.tiers,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export const useOfferStore = create<OfferState>()(
  devtools(
    (set, get) => ({
      offers: offersMock,
      summary: offersSummaryMock,
      filters: defaultFilters,
      page: 1,
      pageSize: 8,
      isSyncing: false,
      isLoading: false,
      isActivating: false,
      formData: defaultOfferFormData(),
      editingOfferId: null,
      previewOpen: false,
      previewOffer: null,
      confirmDialog: { open: false, type: null, offerId: null },
      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          page: 1,
        })),
      setTab: (tab) =>
        set((state) => ({
          filters: { ...state.filters, tab },
          page: 1,
        })),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          page: 1,
        })),
      resetFilters: () =>
        set((state) => ({
          filters: { ...defaultFilters, tab: state.filters.tab },
          page: 1,
        })),
      setPage: (page) => set({ page }),
      setSortBy: (sortBy) =>
        set((state) => ({
          filters: { ...state.filters, sortBy },
        })),
      toggleVisibility: (offerId) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === offerId
              ? { ...offer, visibility: !offer.visibility }
              : offer,
          ),
        })),
      pauseOffer: (offerId) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === offerId
              ? { ...offer, status: "paused" as const, visibility: false }
              : offer,
          ),
        })),
      resumeOffer: (offerId) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === offerId
              ? { ...offer, status: "active" as const, visibility: true }
              : offer,
          ),
        })),
      deleteOffer: (offerId) =>
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== offerId),
        })),
      duplicateOffer: (offerId) => {
        const original = get().offers.find((o) => o.id === offerId);
        if (!original) return null;
        const now = new Date().toISOString();
        const duplicate: Offer = {
          ...original,
          id: `offer-${Date.now()}`,
          offerId: generateOfferId(),
          status: "draft",
          visibility: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ offers: [duplicate, ...state.offers] }));
        return duplicate;
      },
      syncData: async () => {
        set({ isSyncing: true });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        set({
          isSyncing: false,
          offers: [...offersMock],
          summary: offersSummaryMock,
          page: 1,
        });
      },
      exportCsv: () => {
        const offers = get().getFilteredOffers();
        const headers = [
          "Offer ID",
          "Product",
          "Grade",
          "Category",
          "Warehouse",
          "Price",
          "Qty",
          "MOQ",
          "Status",
          "Visibility",
          "Valid Until",
        ];
        const rows = offers.map((o) =>
          [
            o.offerId,
            `"${o.productName}"`,
            o.productGrade,
            `"${o.category}"`,
            `"${o.warehouseName}"`,
            o.basePrice,
            o.quantityMt,
            o.moq,
            o.status,
            o.visibility ? "Visible" : "Hidden",
            o.validUntil,
          ].join(","),
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `offers-export-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      openConfirmDialog: (type, offerId) =>
        set({ confirmDialog: { open: true, type, offerId } }),
      closeConfirmDialog: () =>
        set({ confirmDialog: { open: false, type: null, offerId: null } }),
      getFilteredOffers: () => {
        const { offers, filters } = get();
        let result = [...offers];
        const query = filters.search.trim().toLowerCase();

        if (query) {
          result = result.filter(
            (offer) =>
              offer.offerId.toLowerCase().includes(query) ||
              offer.productName.toLowerCase().includes(query) ||
              offer.productGrade.toLowerCase().includes(query) ||
              offer.category.toLowerCase().includes(query) ||
              offer.warehouseName.toLowerCase().includes(query),
          );
        }

        if (filters.tab !== "all") {
          result = result.filter((offer) => offer.status === filters.tab);
        }

        if (filters.warehouse !== "All Warehouses") {
          result = result.filter(
            (offer) => offer.warehouseName === filters.warehouse,
          );
        }

        if (filters.category !== "All Categories") {
          result = result.filter(
            (offer) => offer.category === filters.category,
          );
        }

        if (filters.status !== "All Statuses") {
          result = result.filter((offer) => offer.status === filters.status);
        }

        if (filters.paymentTerm !== "All Payment Terms") {
          result = result.filter((offer) =>
            offer.paymentTerms.includes(
              filters.paymentTerm as Offer["paymentTerms"][number],
            ),
          );
        }

        if (filters.priceMin) {
          const min = parseFloat(filters.priceMin);
          if (!isNaN(min)) {
            result = result.filter((offer) => offer.basePrice >= min);
          }
        }

        if (filters.priceMax) {
          const max = parseFloat(filters.priceMax);
          if (!isNaN(max)) {
            result = result.filter((offer) => offer.basePrice <= max);
          }
        }

        if (filters.moqMin) {
          const min = parseFloat(filters.moqMin);
          if (!isNaN(min)) {
            result = result.filter((offer) => offer.moq >= min);
          }
        }

        if (filters.moqMax) {
          const max = parseFloat(filters.moqMax);
          if (!isNaN(max)) {
            result = result.filter((offer) => offer.moq <= max);
          }
        }

        if (filters.validityFrom) {
          result = result.filter(
            (offer) => offer.validUntil >= filters.validityFrom,
          );
        }

        if (filters.validityTo) {
          result = result.filter(
            (offer) => offer.validUntil <= filters.validityTo,
          );
        }

        if (filters.dateFrom) {
          result = result.filter(
            (offer) => offer.createdAt >= filters.dateFrom,
          );
        }

        if (filters.dateTo) {
          result = result.filter(
            (offer) => offer.createdAt <= `${filters.dateTo}T23:59:59`,
          );
        }

        switch (filters.sortBy) {
          case "newest":
            result.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            );
            break;
          case "oldest":
            result.sort(
              (a, b) =>
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime(),
            );
            break;
          case "price_asc":
            result.sort((a, b) => a.basePrice - b.basePrice);
            break;
          case "price_desc":
            result.sort((a, b) => b.basePrice - a.basePrice);
            break;
          case "moq":
            result.sort((a, b) => a.moq - b.moq);
            break;
          case "grade":
            result.sort((a, b) => a.productGrade.localeCompare(b.productGrade));
            break;
        }

        return result;
      },
      getPaginatedOffers: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredOffers();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },
      getComputedSummary: () => {
        const offers = get().offers;
        return {
          totalLive: offers.filter((o) => o.status === "active" && o.visibility)
            .length,
          pendingReview: offers.filter((o) => o.status === "pending_review")
            .length,
          approved: offers.filter((o) => o.status === "approved").length,
          needChanges: offers.filter((o) => o.status === "need_changes").length,
        };
      },
      getOfferById: (id) =>
        get().offers.find((o) => o.id === id || o.offerId === id),
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetFormData: () =>
        set({ formData: defaultOfferFormData(), editingOfferId: null }),
      loadOfferForEdit: (offerId) => {
        const offer = get().getOfferById(offerId);
        if (!offer) return;
        set({
          editingOfferId: offer.id,
          formData: {
            productId: offer.productId,
            productName: offer.productName,
            productGrade: offer.productGrade,
            productSubtext: offer.productSubtext,
            category: offer.category,
            warehouseId: offer.warehouseId,
            warehouseName: offer.warehouseName,
            availableInventoryMt: offer.availableInventoryMt,
            allocationMt: offer.allocationMt,
            basePrice: offer.basePrice,
            moq: offer.moq,
            validUntil: offer.validUntil,
            paymentTerms: [...offer.paymentTerms],
            remarks: offer.remarks,
            tiers: offer.tiers.map((tier) => ({ ...tier })),
          },
        });
      },
      updateTiers: (tiers) =>
        set((state) => ({ formData: { ...state.formData, tiers } })),
      recalculateTiers: (basePrice) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tiers: state.formData.tiers.map((tier) =>
              recalcTier(tier, basePrice),
            ),
          },
        })),
      addTier: () =>
        set((state) => {
          const lastTier =
            state.formData.tiers[state.formData.tiers.length - 1];
          const minQty = lastTier
            ? (lastTier.maxQty ?? lastTier.minQty) + 1
            : 1;
          const newTier = recalcTier(
            {
              id: `tier-${Date.now()}`,
              label: `TIER ${state.formData.tiers.length + 1}`,
              minQty,
              maxQty: null,
              discountPercent: 0,
              unitPrice: state.formData.basePrice,
              savingsPerMt: 0,
            },
            state.formData.basePrice,
          );
          return {
            formData: {
              ...state.formData,
              tiers: [...state.formData.tiers, newTier],
            },
          };
        }),
      duplicateTier: (tierId) =>
        set((state) => {
          const source = state.formData.tiers.find((t) => t.id === tierId);
          if (!source) return state;
          const copy = recalcTier(
            {
              ...source,
              id: `tier-${Date.now()}`,
              label: `${source.label} COPY`,
            },
            state.formData.basePrice,
          );
          const index = state.formData.tiers.findIndex((t) => t.id === tierId);
          const tiers = [...state.formData.tiers];
          tiers.splice(index + 1, 0, copy);
          return {
            formData: {
              ...state.formData,
              tiers: tiers.map((tier, i) => ({
                ...tier,
                label: `TIER ${i + 1}`,
              })),
            },
          };
        }),
      removeTier: (tierId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tiers: state.formData.tiers
              .filter((t) => t.id !== tierId)
              .map((tier, i) => ({ ...tier, label: `TIER ${i + 1}` })),
          },
        })),
      updateTier: (tierId, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tiers: state.formData.tiers.map((tier) => {
              if (tier.id !== tierId) return tier;
              return recalcTier({ ...tier, ...data }, state.formData.basePrice);
            }),
          },
        })),
      reorderTiers: (fromIndex, toIndex) =>
        set((state) => {
          const tiers = [...state.formData.tiers];
          const [moved] = tiers.splice(fromIndex, 1);
          if (!moved) return state;
          tiers.splice(toIndex, 0, moved);
          return {
            formData: {
              ...state.formData,
              tiers: tiers.map((tier, i) => ({
                ...tier,
                label: `TIER ${i + 1}`,
              })),
            },
          };
        }),
      saveDraft: () => {
        const { formData, editingOfferId, offers } = get();
        const existing = editingOfferId
          ? offers.find((o) => o.id === editingOfferId)
          : undefined;
        const draft = {
          ...buildOfferFromForm(formData, editingOfferId, existing),
          status: "draft" as const,
          visibility: false,
        };

        if (editingOfferId) {
          set({
            offers: offers.map((offer) =>
              offer.id === editingOfferId ? draft : offer,
            ),
          });
        } else {
          set((state) => ({
            offers: [draft, ...state.offers],
            editingOfferId: draft.id,
          }));
        }
        return draft;
      },
      activateOffer: async () => {
        set({ isActivating: true });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const { formData, editingOfferId, offers } = get();
        const existing = editingOfferId
          ? offers.find((o) => o.id === editingOfferId)
          : undefined;
        const activated = {
          ...buildOfferFromForm(formData, editingOfferId, existing),
          status: "active" as const,
          visibility: true,
        };

        if (editingOfferId) {
          set({
            offers: offers.map((offer) =>
              offer.id === editingOfferId ? activated : offer,
            ),
            isActivating: false,
          });
        } else {
          set((state) => ({
            offers: [activated, ...state.offers],
            isActivating: false,
          }));
        }
        return activated;
      },
      setPreviewOpen: (open, offer = null) =>
        set({ previewOpen: open, previewOffer: offer }),
      setIsActivating: (value) => set({ isActivating: value }),
    }),
    { name: "offer-store" },
  ),
);
