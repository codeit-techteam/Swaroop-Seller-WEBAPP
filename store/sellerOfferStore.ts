import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { defaultOfferForm, sellerOffersMock } from "@/lib/mock/offers";
import { useSellerProductStore } from "@/store/sellerProductStore";
import type {
  BulkPriceSlab,
  OfferFormValues,
  SellerOffer,
} from "@/types/seller";

interface SellerOfferState {
  offers: SellerOffer[];
  search: string;
  status: string;
  page: number;
  pageSize: number;
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
  ) => SellerOffer | null;
  updateOffer: (id: string, data: Partial<SellerOffer>) => void;
  setOfferStatus: (id: string, status: SellerOffer["status"]) => void;
  activateAll: (locationId: string) => number;
  deactivateAll: (locationId: string) => number;
  addBulkPrice: (id: string, slab: Omit<BulkPriceSlab, "id">) => void;
  removeBulkPrice: (offerId: string, slabId: string) => void;
  addRemark: (id: string, remarks: string) => void;
  deleteOffer: (id: string) => void;
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
  };
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export const useSellerOfferStore = create<SellerOfferState>()(
  devtools(
    (set, get) => ({
      offers: sellerOffersMock,
      search: "",
      status: "all",
      page: 1,
      pageSize: 12,
      confirm: { open: false, type: null, offerId: null },
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      createOffer: (values, locationId, asDraft = false) => {
        const product = useSellerProductStore
          .getState()
          .getById(values.productId);
        if (!product) return null;
        const now = new Date().toISOString();
        const offer: SellerOffer = {
          id: `off-${Date.now()}`,
          sellerId: "sel-001",
          locationId,
          productId: values.productId,
          category: product?.category ?? "",
          gradeName: product?.gradeName ?? "",
          manufacturer: product?.manufacturer ?? "",
          price: values.price,
          unit: values.unit,
          availableQty: values.availableQty,
          moq: values.moq,
          validityHours: values.validityHours,
          validUntil: hoursFromNow(values.validityHours),
          paymentTerms: values.paymentTerms,
          deliveryLocation: values.deliveryLocation,
          remarks: values.remarks,
          gstPercent: values.gstPercent,
          bulkPricing: values.bulkPricing,
          status: asDraft ? "draft" : "active",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ offers: [offer, ...state.offers] }));
        return offer;
      },
      updateOffer: (id, data) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === id
              ? { ...offer, ...data, updatedAt: new Date().toISOString() }
              : offer,
          ),
        })),
      setOfferStatus: (id, status) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === id
              ? { ...offer, status, updatedAt: new Date().toISOString() }
              : offer,
          ),
        })),
      activateAll: (locationId) => {
        let count = 0;
        set((state) => ({
          offers: state.offers.map((offer) => {
            if (
              offer.locationId === locationId &&
              (offer.status === "draft" || offer.status === "paused")
            ) {
              count += 1;
              return {
                ...offer,
                status: "active" as const,
                updatedAt: new Date().toISOString(),
              };
            }
            return offer;
          }),
        }));
        return count;
      },
      deactivateAll: (locationId) => {
        let count = 0;
        set((state) => ({
          offers: state.offers.map((offer) => {
            if (offer.locationId === locationId && offer.status === "active") {
              count += 1;
              return {
                ...offer,
                status: "paused" as const,
                updatedAt: new Date().toISOString(),
              };
            }
            return offer;
          }),
        }));
        return count;
      },
      addBulkPrice: (id, slab) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === id
              ? {
                  ...offer,
                  bulkPricing: [
                    ...offer.bulkPricing,
                    { ...slab, id: `bp-${Date.now()}` },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : offer,
          ),
        })),
      removeBulkPrice: (offerId, slabId) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === offerId
              ? {
                  ...offer,
                  bulkPricing: offer.bulkPricing.filter(
                    (slab) => slab.id !== slabId,
                  ),
                }
              : offer,
          ),
        })),
      addRemark: (id, remarks) =>
        set((state) => ({
          offers: state.offers.map((offer) =>
            offer.id === id
              ? { ...offer, remarks, updatedAt: new Date().toISOString() }
              : offer,
          ),
        })),
      deleteOffer: (id) =>
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== id),
        })),
      openConfirm: (type, offerId) =>
        set({ confirm: { open: true, type, offerId: offerId ?? null } }),
      closeConfirm: () =>
        set({ confirm: { open: false, type: null, offerId: null } }),
      getFiltered: (locationId) => {
        const { offers, search, status } = get();
        const query = search.trim().toLowerCase();
        return offers.filter((offer) => {
          if (locationId && offer.locationId !== locationId) return false;
          if (status !== "all" && offer.status !== status) return false;
          if (!query) return true;
          return (
            offer.gradeName.toLowerCase().includes(query) ||
            offer.category.toLowerCase().includes(query)
          );
        });
      },
      getById: (id) => get().offers.find((offer) => offer.id === id),
      getSummary: (locationId) => {
        const offers = get().offers.filter(
          (offer) => !locationId || offer.locationId === locationId,
        );
        return {
          active: offers.filter((offer) => offer.status === "active").length,
          draft: offers.filter((offer) => offer.status === "draft").length,
          paused: offers.filter((offer) => offer.status === "paused").length,
          expiring: offers.filter((offer) => {
            if (offer.status !== "active") return false;
            const hours =
              (new Date(offer.validUntil).getTime() - Date.now()) /
              (1000 * 60 * 60);
            return hours > 0 && hours <= 16;
          }).length,
        };
      },
    }),
    { name: "seller-offer-store" },
  ),
);

export { defaultOfferForm };
