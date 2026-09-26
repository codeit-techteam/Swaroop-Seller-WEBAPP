import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  fetchSellerDispatches,
  fetchSellerOrderById,
  fetchSellerOrdersPage,
  fetchSellerOrderSummary,
  fetchSellerOrderTimeline,
  fetchSellerShipments,
} from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";
import type {
  DispatchStatus,
  SellerDispatch,
  SellerOrder,
  SellerOrderSummary,
  SellerOrderTimelineEvent,
  SellerShipment,
  ShipmentStatus,
} from "@/types/seller";

interface SellerOrderState {
  orders: SellerOrder[];
  summary: SellerOrderSummary | null;
  selectedOrder: SellerOrder | null;
  timelineEvents: SellerOrderTimelineEvent[];
  dispatches: SellerDispatch[];
  shipments: SellerShipment[];
  search: string;
  status: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  detailLoading: boolean;
  loadError: string | null;
  detailError: string | null;
  hydrate: (opts?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  hydrateDetail: (id: string) => Promise<void>;
  selectedDispatchId: string | null;
  selectedShipmentId: string | null;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
  /** @deprecated Client-only; Dispatch page uses seller-dispatches API */
  scheduleDispatch: (id: string, date: string) => void;
  /** @deprecated Client-only; Dispatch page uses seller-dispatches API */
  assignVehicle: (
    id: string,
    vehicle: string,
    transporter: string,
    driver: string,
  ) => void;
  /** @deprecated Client-only; Dispatch page uses seller-dispatches API */
  markDispatchStatus: (id: string, status: DispatchStatus) => void;
  /** @deprecated Client-only; Dispatch page uses seller-dispatches API */
  generateEwayBill: (id: string) => string;
  markShipmentStatus: (id: string, status: ShipmentStatus) => void;
  upsertDispatch: (dispatch: SellerDispatch) => void;
  openDispatch: (id: string) => void;
  closeDispatch: () => void;
  openShipment: (id: string) => void;
  closeShipment: () => void;
  getFilteredOrders: (locationId?: string) => SellerOrder[];
  getOrderById: (id: string) => SellerOrder | undefined;
  getFilteredDispatches: (locationId?: string) => SellerDispatch[];
  getFilteredShipments: (locationId?: string) => SellerShipment[];
}

export const useSellerOrderStore = create<SellerOrderState>()(
  devtools(
    (set, get) => ({
      orders: [],
      summary: null,
      selectedOrder: null,
      timelineEvents: [],
      dispatches: [],
      shipments: [],
      search: "",
      status: "all",
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
      loading: true,
      detailLoading: false,
      loadError: null,
      detailError: null,
      hydrate: async (opts) => {
        const search = opts?.search ?? get().search;
        const status = opts?.status ?? get().status;
        const page = opts?.page ?? get().page;
        const limit = opts?.limit ?? get().pageSize;
        set({
          loading: true,
          loadError: null,
          search,
          status,
          page,
          pageSize: limit,
        });
        try {
          const locationId =
            useLocationStore.getState().selectedLocationId ?? "";
          const [ordersPage, summary, dispatches, shipments] =
            await Promise.all([
              fetchSellerOrdersPage({
                page,
                limit,
                search: search.trim() || undefined,
                status: status === "all" ? undefined : status,
                sortBy: "createdAt",
                sortOrder: "desc",
              }),
              fetchSellerOrderSummary().catch(() => null),
              fetchSellerDispatches(locationId).catch(
                () => [] as SellerDispatch[],
              ),
              fetchSellerShipments(locationId).catch(
                () => [] as SellerShipment[],
              ),
            ]);
          set({
            orders: ordersPage.items,
            summary,
            total: ordersPage.pagination.total,
            totalPages: ordersPage.pagination.totalPages,
            page: ordersPage.pagination.page,
            pageSize: ordersPage.pagination.limit,
            dispatches,
            shipments,
            loading: false,
            loadError: null,
          });
        } catch (error) {
          set({
            orders: [],
            summary: null,
            total: 0,
            totalPages: 1,
            dispatches: [],
            shipments: [],
            loading: false,
            loadError:
              error instanceof Error ? error.message : "Unable to load orders.",
          });
        }
      },
      hydrateDetail: async (id) => {
        set({ detailLoading: true, detailError: null });
        try {
          const [order, timeline] = await Promise.all([
            fetchSellerOrderById(id),
            fetchSellerOrderTimeline(id).catch(() => ({
              poNumber: id,
              events: [] as SellerOrderTimelineEvent[],
            })),
          ]);
          const timelineSteps =
            timeline.events.length > 0
              ? timeline.events.map((event, index, all) => ({
                  id: `${event.type}-${index}`,
                  label: event.label,
                  status:
                    index === all.length - 1
                      ? ("current" as const)
                      : ("completed" as const),
                  at: event.at,
                }))
              : order.timeline;
          set({
            selectedOrder: { ...order, timeline: timelineSteps },
            timelineEvents: timeline.events,
            detailLoading: false,
            detailError: null,
            orders: get().orders.some((item) => item.id === order.id)
              ? get().orders.map((item) =>
                  item.id === order.id ? { ...item, ...order } : item,
                )
              : [order, ...get().orders],
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to load order.";
          const forbidden =
            message.toLowerCase().includes("403") ||
            message.toLowerCase().includes("access");
          set({
            selectedOrder: null,
            timelineEvents: [],
            detailLoading: false,
            detailError: forbidden
              ? "You don't have access to this order."
              : "Unable to load order.",
          });
        }
      },
      selectedDispatchId: null,
      selectedShipmentId: null,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      scheduleDispatch: (id, date) =>
        set((state) => ({
          dispatches: state.dispatches.map((item) =>
            item.id === id
              ? { ...item, scheduledDate: date, status: "scheduled" }
              : item,
          ),
        })),
      assignVehicle: (id, vehicle, transporter, driver) =>
        set((state) => ({
          dispatches: state.dispatches.map((item) =>
            item.id === id
              ? { ...item, vehicle, transporter, driver, status: "scheduled" }
              : item,
          ),
        })),
      markDispatchStatus: (id, status) =>
        set((state) => ({
          dispatches: state.dispatches.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      generateEwayBill: (id) => {
        const ref = `EWB-${Date.now().toString().slice(-6)}`;
        set((state) => ({
          dispatches: state.dispatches.map((item) =>
            item.id === id ? { ...item, ewayBill: ref } : item,
          ),
        }));
        return ref;
      },
      markShipmentStatus: (id, status) =>
        set((state) => ({
          shipments: state.shipments.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      upsertDispatch: (dispatch) =>
        set((state) => {
          const index = state.dispatches.findIndex(
            (item) =>
              item.id === dispatch.id || item.orderId === dispatch.orderId,
          );
          if (index === -1) {
            return { dispatches: [dispatch, ...state.dispatches] };
          }
          const next = [...state.dispatches];
          const current = next[index];
          if (!current) return state;
          next[index] = { ...current, ...dispatch };
          return { dispatches: next };
        }),
      openDispatch: (id) => set({ selectedDispatchId: id }),
      closeDispatch: () => set({ selectedDispatchId: null }),
      openShipment: (id) => set({ selectedShipmentId: id }),
      closeShipment: () => set({ selectedShipmentId: null }),
      getFilteredOrders: () => get().orders,
      getOrderById: (id) =>
        get().selectedOrder?.id === id || get().selectedOrder?.orderId === id
          ? (get().selectedOrder ?? undefined)
          : get().orders.find(
              (order) => order.id === id || order.orderId === id,
            ),
      getFilteredDispatches: (locationId) => {
        const { dispatches, search, status } = get();
        const query = search.trim().toLowerCase();
        return dispatches.filter((item) => {
          if (locationId && item.locationId !== locationId) return false;
          if (status !== "all" && item.status !== status) return false;
          if (!query) return true;
          return (
            item.orderId.toLowerCase().includes(query) ||
            item.gradeName.toLowerCase().includes(query)
          );
        });
      },
      getFilteredShipments: (locationId) => {
        const { shipments, search } = get();
        const query = search.trim().toLowerCase();
        return shipments.filter((item) => {
          if (locationId && item.locationId !== locationId) return false;
          if (!query) return true;
          return (
            item.id.toLowerCase().includes(query) ||
            item.orderId.toLowerCase().includes(query) ||
            item.grade.toLowerCase().includes(query) ||
            item.vehicleNumber.toLowerCase().includes(query)
          );
        });
      },
    }),
    { name: "seller-order-store" },
  ),
);
