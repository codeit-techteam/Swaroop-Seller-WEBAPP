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
  actionPending: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openCounter: () => void;
  closeCounter: () => void;
  accept: (id: string) => Promise<void>;
  reject: (
    id: string,
    payload: { rejectionReason: string; message?: string },
  ) => Promise<void>;
  counter: (id: string, values: CounterOfferValues) => Promise<void>;
  getFiltered: () => SellerPurchaseRequest[];
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
      actionPending: false,
      hydrate: async () => {
        const isInitial = get().requests.length === 0 && get().loading;
        if (isInitial) set({ loading: true, loadError: null });
        else set({ loadError: null });
        try {
          const locationId =
            useLocationStore.getState().selectedLocationId ?? "";
          const requests = await fetchSellerPurchaseRequests(locationId);
          set({ requests, loading: false, loadError: null });
        } catch (error) {
          set({
            loading: false,
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to load purchase requests.",
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
      accept: async (id) => {
        set({ actionPending: true });
        try {
          await acceptSellerPurchaseRequest(id);
          set((state) => ({
            requests: state.requests.map((request) =>
              request.id === id
                ? { ...request, status: "accepted" as const }
                : request,
            ),
          }));
          await get().hydrate();
        } finally {
          set({ actionPending: false });
        }
      },
      reject: async (id, payload) => {
        set({ actionPending: true });
        try {
          await rejectSellerPurchaseRequest(id, payload);
          set((state) => ({
            requests: state.requests.map((request) =>
              request.id === id
                ? { ...request, status: "rejected" as const }
                : request,
            ),
          }));
          await get().hydrate();
        } finally {
          set({ actionPending: false });
        }
      },
      counter: async (id, values) => {
        set({ actionPending: true });
        try {
          await counterSellerPurchaseRequest(id, {
            unitPrice: values.price,
            quantity: values.quantity,
            note: values.remark,
          });
          set((state) => ({
            requests: state.requests.map((request) =>
              request.id === id
                ? {
                    ...request,
                    status: "counter_sent" as const,
                    counterPrice: values.price,
                    counterQty: values.quantity,
                    counterValidity: values.validity,
                    counterRemark: values.remark,
                  }
                : request,
            ),
            counterOpen: false,
          }));
          await get().hydrate();
        } finally {
          set({ actionPending: false });
        }
      },
      getFiltered: () => {
        const { requests, search, status } = get();
        const query = search.trim().toLowerCase();
        return requests.filter((request) => {
          if (status !== "all" && request.status !== status) return false;
          if (!query) return true;
          return (
            request.requestNumber.toLowerCase().includes(query) ||
            request.gradeName.toLowerCase().includes(query) ||
            request.productId.toLowerCase().includes(query)
          );
        });
      },
      getById: (id) => get().requests.find((request) => request.id === id),
    }),
    { name: "seller-request-store" },
  ),
);
