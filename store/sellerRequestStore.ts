import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  acceptSellerPurchaseRequest,
  counterSellerPurchaseRequest,
  fetchSellerPurchaseRequests,
  rejectSellerPurchaseRequest,
} from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";
import type { CounterOfferValues, SellerPurchaseRequest } from "@/types/seller";

interface SellerRequestState {
  requests: SellerPurchaseRequest[];
  search: string;
  status: string;
  page: number;
  pageSize: number;
  loading: boolean;
  loadError: string | null;
  hydrate: () => Promise<void>;
  selectedId: string | null;
  drawerOpen: boolean;
  counterOpen: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openCounter: () => void;
  closeCounter: () => void;
  accept: (id: string) => void;
  reject: (id: string) => void;
  counter: (id: string, values: CounterOfferValues) => void;
  getFiltered: (locationId?: string) => SellerPurchaseRequest[];
  getById: (id: string) => SellerPurchaseRequest | undefined;
}

export const useSellerRequestStore = create<SellerRequestState>()(
  devtools(
    (set, get) => ({
      requests: [],
      search: "",
      status: "all",
      page: 1,
      pageSize: 10,
      loading: true,
      loadError: null,
      hydrate: async () => {
        set({ loading: true, loadError: null });
        try {
          const locationId = useLocationStore.getState().selectedLocationId ?? "";
          const requests = await fetchSellerPurchaseRequests(locationId);
          set({ requests, loading: false, loadError: null });
        } catch (error) {
          set({
            requests: [],
            loading: false,
            loadError: error instanceof Error ? error.message : "Unable to load purchase requests.",
          });
        }
      },
      selectedId: null,
      drawerOpen: false,
      counterOpen: false,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      openDrawer: (id) => set({ selectedId: id, drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false, selectedId: null }),
      openCounter: () => set({ counterOpen: true }),
      closeCounter: () => set({ counterOpen: false }),
      accept: (id) => {
        void acceptSellerPurchaseRequest(id).then(() => get().hydrate());
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id ? { ...request, status: "accepted" } : request,
          ),
        }));
      },
      reject: (id) => {
        void rejectSellerPurchaseRequest(id).then(() => get().hydrate());
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id ? { ...request, status: "rejected" } : request,
          ),
        }));
      },
      counter: (id, values) => {
        void counterSellerPurchaseRequest(id, {
          unitPrice: values.price,
          quantity: values.quantity,
          note: values.remark,
        }).then(() => get().hydrate());
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: "counter_sent",
                  counterPrice: values.price,
                  counterQty: values.quantity,
                  counterValidity: values.validity,
                  counterRemark: values.remark,
                }
              : request,
          ),
          counterOpen: false,
        }));
      },
      getFiltered: (locationId) => {
        const { requests, search, status } = get();
        const query = search.trim().toLowerCase();
        return requests.filter((request) => {
          if (locationId && request.locationId !== locationId) return false;
          if (status !== "all" && request.status !== status) return false;
          if (!query) return true;
          return (
            request.requestNumber.toLowerCase().includes(query) ||
            request.gradeName.toLowerCase().includes(query) ||
            request.buyerId.toLowerCase().includes(query)
          );
        });
      },
      getById: (id) => get().requests.find((request) => request.id === id),
    }),
    { name: "seller-request-store" },
  ),
);
