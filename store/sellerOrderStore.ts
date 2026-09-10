import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { sellerDispatchesMock, sellerOrdersMock } from "@/lib/mock/orders";
import { sellerShipmentsMock } from "@/lib/mock/shipments";
import type {
  DispatchStatus,
  SellerDispatch,
  SellerOrder,
  SellerOrderStatus,
  SellerShipment,
  ShipmentStatus,
} from "@/types/seller";

const ORDER_FLOW: SellerOrderStatus[] = [
  "confirmed",
  "processing",
  "ready_for_dispatch",
  "in_transit",
  "delivered",
];

interface SellerOrderState {
  orders: SellerOrder[];
  dispatches: SellerDispatch[];
  shipments: SellerShipment[];
  search: string;
  status: string;
  page: number;
  pageSize: number;
  selectedDispatchId: string | null;
  selectedShipmentId: string | null;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
  advanceOrder: (id: string) => void;
  setOrderStatus: (id: string, status: SellerOrderStatus) => void;
  scheduleDispatch: (id: string, date: string) => void;
  assignVehicle: (
    id: string,
    vehicle: string,
    transporter: string,
    driver: string,
  ) => void;
  markDispatchStatus: (id: string, status: DispatchStatus) => void;
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

function syncTimeline(
  order: SellerOrder,
  status: SellerOrderStatus,
): SellerOrder {
  const labels: Record<SellerOrderStatus, string> = {
    confirmed: "Order Confirmed",
    processing: "Processing",
    ready_for_dispatch: "Dispatch Scheduled",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  const currentLabel = labels[status];
  const now = new Date().toISOString();
  let seenCurrent = false;
  return {
    ...order,
    status,
    timeline: order.timeline.map((step) => {
      if (step.label === currentLabel) {
        seenCurrent = true;
        return { ...step, status: "current", at: now };
      }
      if (!seenCurrent && status !== "cancelled") {
        return { ...step, status: "completed", at: step.at ?? now };
      }
      return { ...step, status: "pending" };
    }),
  };
}

export const useSellerOrderStore = create<SellerOrderState>()(
  devtools(
    (set, get) => ({
      orders: sellerOrdersMock,
      dispatches: sellerDispatchesMock,
      shipments: sellerShipmentsMock,
      search: "",
      status: "all",
      page: 1,
      pageSize: 10,
      selectedDispatchId: null,
      selectedShipmentId: null,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setPage: (page) => set({ page }),
      advanceOrder: (id) => {
        const order = get().orders.find((item) => item.id === id);
        if (!order) return;
        const index = ORDER_FLOW.indexOf(order.status);
        const next = ORDER_FLOW[index + 1];
        if (!next) return;
        get().setOrderStatus(id, next);
      },
      setOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? syncTimeline(order, status) : order,
          ),
        })),
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
            (item) => item.id === dispatch.id || item.orderId === dispatch.orderId,
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
      getFilteredOrders: (locationId) => {
        const { orders, search, status } = get();
        const query = search.trim().toLowerCase();
        return orders.filter((order) => {
          if (locationId && order.locationId !== locationId) return false;
          if (status !== "all" && order.status !== status) return false;
          if (!query) return true;
          return (
            order.orderId.toLowerCase().includes(query) ||
            order.gradeName.toLowerCase().includes(query)
          );
        });
      },
      getOrderById: (id) =>
        get().orders.find((order) => order.id === id || order.orderId === id),
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
