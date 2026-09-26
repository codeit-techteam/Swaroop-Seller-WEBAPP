import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { defaultOfferForm } from "@/lib/mock/offers";
import {
  activateSellerOffer,
  bulkActivateSellerOffers,
  bulkPauseSellerOffers,
  createSellerOffer,
  deleteSellerOffer,
  fetchSellerOffers,
  fetchSellerOfferSummary,
  pauseSellerOffer,
  updateSellerOffer,
} from "@/services/commerce";
import { useSellerProductStore } from "@/store/sellerProductStore";
import type {
  BulkPriceSlab,
  OfferFormValues,
  SellerOffer,
  SellerOfferSummary,
} from "@/types/seller";

interface SellerOfferState {
  offers: SellerOffer[];
  summary: SellerOfferSummary | null;
  search: string;
  status: string;
  page: number;
  pageSize: number;
  loading: boolean;
  loadError: string | null;
  hydrate: (opts?: { search?: string }) => Promise<void>;
  confirm: {
    open: boolean;
    type:
      | "activate"
      | "deactivate"
      | "activate_all"
      | "deactivate_all"
      | "delete"
      | null;
    offerId: string | null;
  };
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
  createOffer: (
    values: OfferFormValues,
    locationId: string,
    asDraft?: boolean,
  ) => Promise<SellerOffer | null>;
  updateOffer: (id: string, data: Partial<SellerOffer>) => Promise<void>;
  setOfferStatus: (id: string, status: SellerOffer["status"]) => Promise<void>;
  activateAll: (locationId: string) => Promise<number>;
  deactivateAll: (locationId: string) => Promise<number>;
  addBulkPrice: (id: string, slab: Omit<BulkPriceSlab, "id">) => Promise<void>;
  removeBulkPrice: (offerId: string, slabId: string) => Promise<void>;
  addRemark: (id: string, remarks: string) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  openConfirm: (
    type: SellerOfferState["confirm"]["type"],
    offerId?: string,
  ) => void;
  closeConfirm: () => void;
  getFiltered: (locationId?: string) => SellerOffer[];
  getById: (id: string) => SellerOffer | undefined;
  getSummary: (locationId?: string) => {
    active: number;
    draft: number;
    expiring: number;
    paused: number;
    pendingPurchaseRequests: number;
    soldOut: number;
  };
}

const SELLER_PAYMENT_METHODS = new Set([
  "ADVANCE",
  "ON_LOADING",
  "ON_DELIVERY",
  "BEFORE_DISPATCH",
]);

function toSellerPaymentMethod(value: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (SELLER_PAYMENT_METHODS.has(normalized)) return normalized;
  if (normalized.includes("LOADING")) return "ON_LOADING";
  if (normalized.includes("DELIVERY")) return "ON_DELIVERY";
  return "ADVANCE";
}

const emptySummary: SellerOfferSummary = {
  active: 0,
  draft: 0,
  paused: 0,
  expired: 0,
  pendingReview: 0,
  closed: 0,
  rejected: 0,
  expiringSoon: 0,
  soldOut: 0,
  pendingPurchaseRequests: 0,
};

export const useSellerOfferStore = create<SellerOfferState>()(
  devtools(
    (set, get) => ({
      offers: [],
      summary: null,
      search: "",
      status: "all",
      page: 1,
      pageSize: 12,
      loading: true,
      loadError: null,
      hydrate: async (opts) => {
        set({ loading: true, loadError: null });
        try {
          const search = opts?.search ?? get().search;
          const [offers, summary] = await Promise.all([
            fetchSellerOffers({
              // List all seller offers; client scopes by warehouse when present.
              search: search || undefined,
              page: 1,
              limit: 100,
            }),
            fetchSellerOfferSummary(),
          ]);
          set({
            offers,
            summary,
            loading: false,
            loadError: null,
          });
        } catch (error) {
          set({
            offers: [],
            summary: null,
            loading: false,
            loadError:
              error instanceof Error ? error.message : "Unable to load offers.",
          });
        }
      },
      confirm: { open: false, type: null, offerId: null },
      setSearch: (search) => {
        set({ search, page: 1 });
      },
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      createOffer: async (values, locationId, asDraft = false) => {
        const product = useSellerProductStore
          .getState()
          .getById(values.productId);
        if (!product) return null;
        try {
          const priceTiers = (values.bulkPricing ?? [])
            .filter((slab) => slab.minQty > 0 && slab.price > 0)
            .map((slab) => ({
              minQty: slab.minQty,
              maxQty: slab.maxQty ?? undefined,
              price: slab.price,
            }));

          const created = await createSellerOffer({
            productId: values.productId,
            quantity: values.availableQty,
            moq: values.moq,
            basePrice: values.price,
            unit: values.unit || product.unit || "MT",
            warehouseId: locationId || undefined,
            inventoryId: product.inventoryId,
            // Server calculates validFrom/validUntil from hours (do not trust browser clock).
            validityHours: values.validityHours,
            deliveryTerms: values.deliveryLocation,
            paymentTerms: {
              method: toSellerPaymentMethod(values.paymentTerms),
            },
            metadata: {
              remarks: values.remarks?.trim() || undefined,
              gstPercent: values.gstPercent,
              validityHours: values.validityHours,
            },
            priceTiers: priceTiers.length ? priceTiers : undefined,
          });
          await get().hydrate();
          if (!asDraft && created?.id) {
            await activateSellerOffer(created.id);
            await get().hydrate();
          }
          return get().offers.find((o) => o.id === created?.id) ?? null;
        } catch (error) {
          set({
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to create offer.",
          });
          throw error;
        }
      },
      updateOffer: async (id, data) => {
        const existing = get().getById(id);
        try {
          await updateSellerOffer(id, {
            basePrice: data.price,
            quantity: data.availableQty,
            moq: data.moq,
            deliveryTerms: data.deliveryLocation,
            validUntil: data.validUntil,
            version: existing?.version,
          });
          await get().hydrate();
        } catch (error) {
          await get().hydrate();
          throw error;
        }
      },
      setOfferStatus: async (id, status) => {
        const previous = get().offers;
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === id
              ? { ...offer, status, updatedAt: new Date().toISOString() }
              : offer,
          ),
        }));
        try {
          if (status === "active") await activateSellerOffer(id);
          if (status === "paused") await pauseSellerOffer(id);
          await get().hydrate();
        } catch (error) {
          set({ offers: previous });
          throw error;
        }
      },
      activateAll: async (locationId) => {
        const ids = get()
          .offers.filter(
            (offer) =>
              (!locationId || offer.locationId === locationId) &&
              (offer.status === "draft" || offer.status === "paused"),
          )
          .map((offer) => offer.id);
        if (!ids.length) return 0;
        const result = await bulkActivateSellerOffers(ids);
        await get().hydrate();
        return result?.succeeded ?? 0;
      },
      deactivateAll: async (locationId) => {
        const ids = get()
          .offers.filter(
            (offer) =>
              (!locationId || offer.locationId === locationId) &&
              offer.status === "active",
          )
          .map((offer) => offer.id);
        if (!ids.length) return 0;
        const result = await bulkPauseSellerOffers(ids);
        await get().hydrate();
        return result?.succeeded ?? 0;
      },
      addBulkPrice: async (id, slab) => {
        const offer = get().getById(id);
        if (!offer) return;
        const nextTiers = [
          ...offer.bulkPricing,
          { ...slab, id: `bp-${Date.now()}` },
        ];
        await updateSellerOffer(id, {
          version: offer.version,
          priceTiers: nextTiers.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty ?? undefined,
            price: tier.price,
          })),
        });
        await get().hydrate();
      },
      removeBulkPrice: async (offerId, slabId) => {
        const offer = get().getById(offerId);
        if (!offer) return;
        const nextTiers = offer.bulkPricing.filter(
          (slab) => slab.id !== slabId,
        );
        await updateSellerOffer(offerId, {
          version: offer.version,
          priceTiers: nextTiers.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty ?? undefined,
            price: tier.price,
          })),
        });
        await get().hydrate();
      },
      addRemark: async (id, remarks) => {
        const offer = get().getById(id);
        if (!offer) return;
        await updateSellerOffer(id, {
          version: offer.version,
          metadata: { remarks },
          deliveryTerms: offer.deliveryLocation,
        });
        await get().hydrate();
      },
      deleteOffer: async (id) => {
        const previous = get().offers;
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== id),
        }));
        try {
          await deleteSellerOffer(id);
          await get().hydrate();
        } catch (error) {
          set({ offers: previous });
          throw error;
        }
      },
      openConfirm: (type, offerId) =>
        set({ confirm: { open: true, type, offerId: offerId ?? null } }),
      closeConfirm: () =>
        set({ confirm: { open: false, type: null, offerId: null } }),
      getFiltered: (locationId) => {
        const { offers, search, status } = get();
        const query = search.trim().toLowerCase();
        return offers.filter((offer) => {
          if (locationId && offer.locationId && offer.locationId !== locationId)
            return false;
          if (status !== "all" && offer.status !== status) return false;
          if (!query) return true;
          return (
            offer.gradeName.toLowerCase().includes(query) ||
            offer.category.toLowerCase().includes(query) ||
            (offer.referenceNumber ?? "").toLowerCase().includes(query)
          );
        });
      },
      getById: (id) => get().offers.find((offer) => offer.id === id),
      getSummary: () => {
        const summary = get().summary ?? emptySummary;
        return {
          active: summary.active,
          draft: summary.draft,
          paused: summary.paused,
          expiring: summary.expiringSoon,
          pendingPurchaseRequests: summary.pendingPurchaseRequests,
          soldOut: summary.soldOut,
        };
      },
    }),
    { name: "seller-offer-store" },
  ),
);

export { defaultOfferForm };
