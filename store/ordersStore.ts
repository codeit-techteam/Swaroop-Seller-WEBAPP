import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { computeOrderSummary, ordersMock } from "@/mock/orders";
import type {
  AcceptOrderForm,
  Order,
  OrderFilters,
  OrderSummary,
  OrderTab,
  RejectOrderForm,
  StatusUpdateForm,
  StatusUpdateValue,
  SupportTicket,
  SupportTicketForm,
  TimelineStep,
} from "@/types/orders";
import {
  defaultAcceptOrderForm,
  defaultRejectOrderForm,
  defaultStatusUpdateForm,
  defaultSupportTicketForm,
  STATUS_UPDATE_OPTIONS,
} from "@/types/orders";

type DialogType =
  "update_status" | "support_ticket" | "accept" | "reject" | null;

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  activeTab: OrderTab;
  filters: OrderFilters;
  appliedFilters: OrderFilters;
  page: number;
  pageSize: number;
  panelOpen: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
  hasError: boolean;
  dialogType: DialogType;
  dialogOrderId: string | null;
  statusForm: StatusUpdateForm;
  supportForm: SupportTicketForm;
  acceptForm: AcceptOrderForm;
  rejectForm: RejectOrderForm;
  supportTickets: SupportTicket[];

  setSearch: (search: string) => void;
  setFilter: <K extends keyof OrderFilters>(
    key: K,
    value: OrderFilters[K],
  ) => void;
  applyTopFilters: () => void;
  resetFilters: () => void;
  setActiveTab: (tab: OrderTab) => void;
  setPage: (page: number) => void;
  selectOrder: (order: Order) => void;
  selectOrderById: (id: string) => void;
  closePanel: () => void;
  openDialog: (type: DialogType, orderId: string) => void;
  closeDialog: () => void;
  setStatusForm: (data: Partial<StatusUpdateForm>) => void;
  setSupportForm: (data: Partial<SupportTicketForm>) => void;
  setAcceptForm: (data: Partial<AcceptOrderForm>) => void;
  setRejectForm: (data: Partial<RejectOrderForm>) => void;
  updateOrderStatus: (orderId: string) => void;
  submitSupportTicket: (orderId: string) => SupportTicket | null;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  refreshData: () => Promise<void>;
  retryLoad: () => Promise<void>;
  exportCsv: () => void;
  downloadInvoice: (orderId: string) => Promise<"ok" | "failed">;
  downloadInvoicesBulk: () => Promise<number>;
  downloadDocument: (
    orderId: string,
    documentId: string,
  ) => Promise<"ok" | "failed">;
  printOrder: (orderId: string) => void;
  getFilteredOrders: () => Order[];
  getPaginatedOrders: () => Order[];
  getTabCounts: () => Record<OrderTab, number>;
  getComputedSummary: () => OrderSummary;
  getOrderById: (id: string) => Order | undefined;
}

const defaultFilters: OrderFilters = {
  search: "",
  status: "All Status",
  warehouse: "All Warehouses",
  paymentType: "All Payment Types",
  dateFrom: "",
  dateTo: "",
  orderValue: "All Values",
};

function matchesTab(order: Order, tab: OrderTab): boolean {
  if (tab === "new") return order.status === "new";
  if (tab === "accepted") return order.status === "accepted";
  if (tab === "processing")
    return order.status === "processing" || order.status === "delayed";
  if (tab === "dispatch_ready") return order.status === "dispatch_ready";
  if (tab === "in_transit") return order.status === "in_transit";
  if (tab === "delivered") return order.status === "delivered";
  if (tab === "cancelled") return order.status === "cancelled";
  return true;
}

function matchesValueRange(total: number, range: OrderFilters["orderValue"]) {
  if (range === "All Values") return true;
  if (range === "Under 5L") return total < 500_000;
  if (range === "5L - 25L") return total >= 500_000 && total < 2_500_000;
  if (range === "25L - 1Cr") return total >= 2_500_000 && total < 10_000_000;
  if (range === "Above 1Cr") return total >= 10_000_000;
  return true;
}

function syncSelected(orders: Order[], selected: Order | null): Order | null {
  if (!selected) return null;
  return orders.find((o) => o.id === selected.id) ?? null;
}

function mockPdf(name: string): void {
  const content = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 68 >>stream
BT /F1 18 Tf 72 720 Td (${name}) Tj ET
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
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function rebuildListTimeline(
  status: Order["status"],
  createdAt: string,
): TimelineStep[] {
  const steps = [
    { key: "confirmed", title: "Order Confirmed" },
    { key: "qc", title: "Quality Check & Lab Testing" },
    { key: "dispatch_pending", title: "Dispatch Pending" },
    { key: "in_transit", title: "In Transit" },
    { key: "delivered", title: "Delivered" },
  ];
  const currentIndex: Record<Order["status"], number> = {
    new: 0,
    accepted: 0,
    processing: 1,
    dispatch_ready: 2,
    in_transit: 3,
    delivered: 4,
    delayed: 3,
    cancelled: 0,
  };
  const idx = currentIndex[status];
  return steps.map((step, i) => {
    let stepStatus: TimelineStep["status"] = "pending";
    if (i < idx) stepStatus = "completed";
    else if (i === idx)
      stepStatus = status === "delivered" ? "completed" : "current";
    return {
      id: `tl-${step.key}`,
      key: step.key,
      title: step.title,
      description:
        stepStatus === "completed"
          ? "Completed"
          : stepStatus === "current"
            ? "In progress"
            : "Awaiting action",
      timestamp: i <= idx ? createdAt : undefined,
      status: stepStatus,
    };
  });
}

function rebuildDetailTimeline(
  status: Order["status"],
  createdAt: string,
): TimelineStep[] {
  const steps = [
    { key: "created", title: "Order Created" },
    { key: "seller_approved", title: "Seller Approval" },
    { key: "payment", title: "Payment Verified" },
    { key: "dispatch_ready", title: "Dispatch Ready" },
    { key: "loading", title: "Loading" },
    { key: "in_transit", title: "In Transit" },
    { key: "delivered", title: "Delivered" },
  ];
  const currentIndex: Record<Order["status"], number> = {
    new: 1,
    accepted: 2,
    processing: 3,
    dispatch_ready: 3,
    in_transit: 5,
    delivered: 6,
    delayed: 5,
    cancelled: 1,
  };
  const idx = currentIndex[status];
  return steps.map((step, i) => {
    let stepStatus: TimelineStep["status"] = "pending";
    if (i < idx) stepStatus = "completed";
    else if (i === idx)
      stepStatus = status === "delivered" ? "completed" : "current";
    return {
      id: `dtl-${step.key}`,
      key: step.key,
      title: step.title,
      description:
        stepStatus === "completed"
          ? "Completed"
          : stepStatus === "current"
            ? status === "new" && step.key === "seller_approved"
              ? "Pending Seller Review"
              : "In progress"
            : "Awaiting action",
      timestamp: i <= idx ? createdAt : undefined,
      status: stepStatus,
    };
  });
}

function mapStatusUpdate(value: StatusUpdateValue): Order["status"] {
  return (
    STATUS_UPDATE_OPTIONS.find((o) => o.value === value)?.mapsTo ?? "processing"
  );
}

export const useOrdersStore = create<OrdersState>()(
  devtools(
    (set, get) => ({
      orders: ordersMock,
      selectedOrder: null,
      activeTab: "new",
      filters: defaultFilters,
      appliedFilters: defaultFilters,
      page: 1,
      pageSize: 6,
      panelOpen: false,
      isRefreshing: false,
      isLoading: false,
      hasError: false,
      dialogType: null,
      dialogOrderId: null,
      statusForm: defaultStatusUpdateForm,
      supportForm: defaultSupportTicketForm,
      acceptForm: defaultAcceptOrderForm,
      rejectForm: defaultRejectOrderForm,
      supportTickets: [],

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

      applyTopFilters: () =>
        set((state) => ({
          appliedFilters: { ...state.filters },
          page: 1,
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters,
          appliedFilters: defaultFilters,
          page: 1,
        }),

      setActiveTab: (tab) => set({ activeTab: tab, page: 1 }),

      setPage: (page) => set({ page }),

      selectOrder: (order) => set({ selectedOrder: order, panelOpen: true }),

      selectOrderById: (id) => {
        const order = get().orders.find(
          (o) => o.id === id || o.orderNumber === id,
        );
        if (order) set({ selectedOrder: order, panelOpen: true });
      },

      closePanel: () => set({ selectedOrder: null, panelOpen: false }),

      openDialog: (type, orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        set({
          dialogType: type,
          dialogOrderId: orderId,
          selectedOrder: order ?? get().selectedOrder,
          statusForm: defaultStatusUpdateForm,
          supportForm: defaultSupportTicketForm,
          acceptForm: {
            ...defaultAcceptOrderForm,
            estimatedDispatch: order ? order.dispatchDate.slice(0, 10) : "",
          },
          rejectForm: defaultRejectOrderForm,
        });
      },

      closeDialog: () =>
        set({
          dialogType: null,
          dialogOrderId: null,
          statusForm: defaultStatusUpdateForm,
          supportForm: defaultSupportTicketForm,
          acceptForm: defaultAcceptOrderForm,
          rejectForm: defaultRejectOrderForm,
        }),

      setStatusForm: (data) =>
        set((state) => ({
          statusForm: { ...state.statusForm, ...data },
        })),

      setSupportForm: (data) =>
        set((state) => ({
          supportForm: { ...state.supportForm, ...data },
        })),

      setAcceptForm: (data) =>
        set((state) => ({
          acceptForm: { ...state.acceptForm, ...data },
        })),

      setRejectForm: (data) =>
        set((state) => ({
          rejectForm: { ...state.rejectForm, ...data },
        })),

      updateOrderStatus: (orderId) => {
        const { statusForm } = get();
        if (!statusForm.status) return;
        const nextStatus = mapStatusUpdate(statusForm.status);
        const now = new Date().toISOString();

        set((state) => {
          const orders = state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updated: Order = {
              ...order,
              status: nextStatus,
              updatedAt: now,
              pendingInvoice:
                nextStatus === "accepted" || nextStatus === "processing",
              timeline: rebuildListTimeline(nextStatus, order.createdAt),
              detailTimeline: rebuildDetailTimeline(
                nextStatus,
                order.createdAt,
              ),
              documents: order.documents.map((doc) => {
                if (doc.type === "invoice" && nextStatus !== "new") {
                  return { ...doc, available: true };
                }
                if (
                  doc.type === "loading_slip" &&
                  ["dispatch_ready", "in_transit", "delivered"].includes(
                    nextStatus,
                  )
                ) {
                  return { ...doc, available: true };
                }
                if (
                  doc.type === "eway_bill" &&
                  ["in_transit", "delivered", "delayed"].includes(nextStatus)
                ) {
                  return { ...doc, available: true };
                }
                return doc;
              }),
            };
            return updated;
          });
          return {
            orders,
            selectedOrder: syncSelected(orders, state.selectedOrder),
            dialogType: null,
            dialogOrderId: null,
            statusForm: defaultStatusUpdateForm,
          };
        });
      },

      submitSupportTicket: (orderId) => {
        const { supportForm } = get();
        if (!supportForm.issueType || !supportForm.description.trim()) {
          return null;
        }
        const ticket: SupportTicket = {
          id: `tkt-${Date.now()}`,
          orderId,
          issueType: supportForm.issueType,
          description: supportForm.description.trim(),
          attachmentName: supportForm.attachmentName || undefined,
          createdAt: new Date().toISOString(),
          status: "open",
        };
        set((state) => ({
          supportTickets: [ticket, ...state.supportTickets],
          dialogType: null,
          dialogOrderId: null,
          supportForm: defaultSupportTicketForm,
        }));
        return ticket;
      },

      acceptOrder: (orderId) => {
        const { acceptForm } = get();
        const now = new Date().toISOString();
        set((state) => {
          const orders = state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const nextStatus = "accepted" as const;
            const invoiceNumber =
              order.invoiceNumber ??
              `INV-${900 + Number(order.id.replace(/\D/g, "") || "1")}`;
            return {
              ...order,
              status: nextStatus,
              acceptedAt: now,
              updatedAt: now,
              estimatedDispatch:
                acceptForm.estimatedDispatch || order.dispatchDate,
              pendingInvoice: false,
              invoiceNumber,
              documents: order.documents.map((doc) =>
                doc.type === "invoice"
                  ? {
                      ...doc,
                      available: true,
                      number: invoiceNumber,
                      name: `Invoice #${invoiceNumber}`,
                    }
                  : doc,
              ),
              timeline: rebuildListTimeline(nextStatus, order.createdAt),
              detailTimeline: rebuildDetailTimeline(
                nextStatus,
                order.createdAt,
              ),
              settlementStatus: "funds_secured" as const,
            };
          });
          return {
            orders,
            selectedOrder: syncSelected(orders, state.selectedOrder),
            dialogType: null,
            dialogOrderId: null,
            acceptForm: defaultAcceptOrderForm,
          };
        });
      },

      rejectOrder: (orderId) => {
        const { rejectForm } = get();
        if (!rejectForm.reason) return;
        const now = new Date().toISOString();
        set((state) => {
          const orders = state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              status: "cancelled" as const,
              updatedAt: now,
              rejectReason: rejectForm.reason || undefined,
              rejectRemark: rejectForm.remarks || undefined,
              pendingInvoice: false,
              timeline: rebuildListTimeline("cancelled", order.createdAt),
              detailTimeline: rebuildDetailTimeline(
                "cancelled",
                order.createdAt,
              ),
            };
          });
          return {
            orders,
            selectedOrder: syncSelected(orders, state.selectedOrder),
            dialogType: null,
            dialogOrderId: null,
            rejectForm: defaultRejectOrderForm,
          };
        });
      },

      refreshData: async () => {
        set({ isRefreshing: true, hasError: false });
        await new Promise((r) => setTimeout(r, 700));
        set({ isRefreshing: false });
      },

      retryLoad: async () => {
        set({ isLoading: true, hasError: false });
        await new Promise((r) => setTimeout(r, 800));
        set({
          isLoading: false,
          orders: [...ordersMock],
          hasError: false,
        });
      },

      exportCsv: () => {
        const rows = get().getFilteredOrders();
        const header = [
          "Order ID",
          "Status",
          "Product Grade",
          "Quantity MT",
          "Warehouse",
          "Dispatch Date",
          "ETA",
          "Payment Terms",
          "Buyer Company",
          "Total Landed Cost",
        ];
        const lines = rows.map((o) =>
          [
            o.orderNumber,
            o.status,
            o.productGrade,
            o.quantityMt.toFixed(2),
            o.warehouseLabel,
            o.dispatchDate.slice(0, 10),
            o.eta.slice(0, 10),
            o.paymentLabel,
            o.buyerCompany,
            o.financials.totalLandedCost.toFixed(2),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        );
        const csv = [header.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders-export-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },

      downloadInvoice: async (orderId) => {
        await new Promise((r) => setTimeout(r, 500));
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !order.invoiceNumber) return "failed";
        mockPdf(`${order.invoiceNumber}.pdf`);
        return "ok";
      },

      downloadInvoicesBulk: async () => {
        const ready = get()
          .getFilteredOrders()
          .filter((o) => o.invoiceNumber);
        await new Promise((r) => setTimeout(r, 600));
        ready.slice(0, 5).forEach((o) => {
          mockPdf(`${o.invoiceNumber}.pdf`);
        });
        return ready.length;
      },

      downloadDocument: async (orderId, documentId) => {
        await new Promise((r) => setTimeout(r, 450));
        const order = get().orders.find((o) => o.id === orderId);
        const doc = order?.documents.find((d) => d.id === documentId);
        if (!doc?.available) return "failed";
        mockPdf(`${doc.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
        return "ok";
      },

      printOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        const win = window.open("", "_blank", "width=800,height=900");
        if (!win) return;
        win.document
          .write(`<!doctype html><html><head><title>${order.orderNumber}</title>
<style>body{font-family:system-ui,sans-serif;padding:32px;color:#0f172a}
h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}
td,th{border:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}</style></head><body>
<h1>Order ${order.orderNumber}</h1>
<p>${order.productName} · ${order.quantityMt.toFixed(2)} MT</p>
<table>
<tr><th>Warehouse</th><td>${order.warehouseLabel}</td></tr>
<tr><th>Status</th><td>${order.status}</td></tr>
<tr><th>Payment</th><td>${order.paymentLabel}</td></tr>
<tr><th>Total</th><td>₹${order.financials.totalLandedCost.toLocaleString("en-IN")}</td></tr>
</table>
<script>window.print()</script></body></html>`);
        win.document.close();
      },

      getFilteredOrders: () => {
        const { orders, activeTab, filters, appliedFilters } = get();
        const f = {
          ...appliedFilters,
          search: filters.search,
          status: filters.status,
          warehouse: filters.warehouse,
          paymentType: filters.paymentType,
          dateFrom: filters.dateFrom || appliedFilters.dateFrom,
          dateTo: filters.dateTo || appliedFilters.dateTo,
        };
        const q = f.search.trim().toLowerCase();

        return orders.filter((order) => {
          if (!matchesTab(order, activeTab)) return false;
          if (f.status !== "All Status" && order.status !== f.status)
            return false;
          if (
            f.warehouse !== "All Warehouses" &&
            order.warehouse !== f.warehouse
          )
            return false;
          if (
            f.paymentType !== "All Payment Types" &&
            order.paymentTerm !== f.paymentType
          )
            return false;
          if (
            !matchesValueRange(
              order.financials.totalLandedCost,
              appliedFilters.orderValue,
            )
          )
            return false;
          if (f.dateFrom) {
            const from = new Date(f.dateFrom).getTime();
            if (new Date(order.createdAt).getTime() < from) return false;
          }
          if (f.dateTo) {
            const to = new Date(f.dateTo).getTime() + 86_400_000;
            if (new Date(order.createdAt).getTime() > to) return false;
          }
          if (q) {
            const hay = [
              order.orderNumber,
              order.productName,
              order.productGrade,
              order.warehouseLabel,
              order.buyerCompany,
              order.materialCategory,
            ]
              .join(" ")
              .toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
      },

      getPaginatedOrders: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredOrders();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getTabCounts: () => {
        const { orders } = get();
        const tabs: OrderTab[] = [
          "new",
          "accepted",
          "processing",
          "dispatch_ready",
          "in_transit",
          "delivered",
          "cancelled",
        ];
        return tabs.reduce(
          (acc, tab) => {
            acc[tab] = orders.filter((o) => matchesTab(o, tab)).length;
            return acc;
          },
          {} as Record<OrderTab, number>,
        );
      },

      getComputedSummary: () => computeOrderSummary(get().orders),

      getOrderById: (id) =>
        get().orders.find((o) => o.id === id || o.orderNumber === id),
    }),
    { name: "orders-store" },
  ),
);
