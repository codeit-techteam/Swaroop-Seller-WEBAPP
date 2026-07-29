import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { computeShipmentSummary, shipmentsMock } from "@/mock/shipments";
import type {
  GenerateEwayFormData,
  MarkDeliveredFormData,
  Shipment,
  ShipmentDialogType,
  ShipmentFilters,
  ShipmentSummary,
  ShipmentTab,
  TimelineStepKey,
  UploadPodFormData,
} from "@/types/shipments";
import {
  defaultGenerateEwayForm,
  defaultMarkDeliveredForm,
  defaultUploadPodForm,
  TIMELINE_STEP_LABELS,
} from "@/types/shipments";

interface ShipmentState {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  activeTab: ShipmentTab;
  filters: ShipmentFilters;
  page: number;
  pageSize: number;
  panelOpen: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
  dialogType: ShipmentDialogType;
  dialogShipmentId: string | null;
  ewayForm: GenerateEwayFormData;
  markDeliveredForm: MarkDeliveredFormData;
  uploadPodForm: UploadPodFormData;

  setSearch: (search: string) => void;
  setFilter: <K extends keyof ShipmentFilters>(
    key: K,
    value: ShipmentFilters[K],
  ) => void;
  resetFilters: () => void;
  setActiveTab: (tab: ShipmentTab) => void;
  setPage: (page: number) => void;
  selectShipment: (shipment: Shipment) => void;
  selectShipmentById: (id: string) => void;
  closePanel: () => void;
  openDialog: (type: ShipmentDialogType, shipmentId: string) => void;
  closeDialog: () => void;
  setEwayForm: (data: Partial<GenerateEwayFormData>) => void;
  setMarkDeliveredForm: (data: Partial<MarkDeliveredFormData>) => void;
  setUploadPodForm: (data: Partial<UploadPodFormData>) => void;
  generateInvoice: (shipmentId: string) => void;
  generateEway: (shipmentId: string) => { ewayBillNumber: string };
  uploadPod: (shipmentId: string) => { ok: boolean; reason?: string };
  markDelivered: (shipmentId: string) => { ok: boolean; reason?: string };
  refreshData: () => Promise<void>;
  exportCsv: () => void;
  downloadDocument: (
    shipmentId: string,
    documentId: string,
  ) => Promise<"ok" | "failed">;
  previewDocument: (shipmentId: string, documentId: string) => void;
  getFilteredShipments: () => Shipment[];
  getPaginatedShipments: () => Shipment[];
  getTabCounts: () => Record<ShipmentTab, number>;
  getComputedSummary: () => ShipmentSummary;
  getShipmentById: (id: string) => Shipment | undefined;
}

const defaultFilters: ShipmentFilters = {
  search: "",
  status: "All Statuses",
  location: "All Locations",
  transporter: "All Transporters",
  dateFrom: null,
  dateTo: null,
};

function matchesTab(shipment: Shipment, tab: ShipmentTab): boolean {
  if (tab === "active") {
    return (
      shipment.status === "ready_for_dispatch" ||
      shipment.status === "in_transit" ||
      shipment.status === "dispatched"
    );
  }
  if (tab === "pending") return shipment.status === "pending";
  if (tab === "delayed")
    return shipment.status === "delayed" || shipment.isDelayed;
  if (tab === "completed") return shipment.status === "delivered";
  return true;
}

function syncSelected(
  shipments: Shipment[],
  selected: Shipment | null,
): Shipment | null {
  if (!selected) return null;
  return shipments.find((s) => s.id === selected.id) ?? null;
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

function rebuildTimeline(
  status: Shipment["status"],
  timeline: Shipment["timeline"],
  deliveredAt?: string,
): Shipment["timeline"] {
  const stepOrder: TimelineStepKey[] = [
    "order_accepted",
    "payment_verified",
    "invoice_generated",
    "vehicle_assigned",
    "loading_started",
    "loading_completed",
    "shipment_dispatched",
    "reached_destination",
    "delivered",
  ];

  let completedThrough = 0;
  if (status === "pending") completedThrough = 0;
  else if (status === "ready_for_dispatch") completedThrough = 5;
  else if (
    status === "dispatched" ||
    status === "in_transit" ||
    status === "delayed"
  )
    completedThrough = 6;
  else if (status === "delivered") completedThrough = 8;

  const now = new Date().toISOString();

  return stepOrder.map((key, index) => {
    const existing = timeline.find((t) => t.key === key);
    let stepStatus: Shipment["timeline"][0]["status"] = "pending";
    if (index < completedThrough) stepStatus = "completed";
    else if (index === completedThrough && status !== "delivered")
      stepStatus = "current";

    return {
      key,
      label: TIMELINE_STEP_LABELS[key],
      status: stepStatus,
      timestamp:
        stepStatus === "completed" || stepStatus === "current"
          ? key === "delivered" && deliveredAt
            ? deliveredAt
            : (existing?.timestamp ?? now)
          : undefined,
      description: existing?.description,
    };
  });
}

export const useShipmentStore = create<ShipmentState>()(
  devtools(
    (set, get) => ({
      shipments: shipmentsMock,
      selectedShipment: null,
      activeTab: "active",
      filters: defaultFilters,
      page: 1,
      pageSize: 10,
      panelOpen: false,
      isRefreshing: false,
      isLoading: false,
      dialogType: null,
      dialogShipmentId: null,
      ewayForm: defaultGenerateEwayForm,
      markDeliveredForm: defaultMarkDeliveredForm,
      uploadPodForm: defaultUploadPodForm,

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

      setActiveTab: (tab) => set({ activeTab: tab, page: 1 }),

      setPage: (page) => set({ page }),

      selectShipment: (shipment) =>
        set({ selectedShipment: shipment, panelOpen: true }),

      selectShipmentById: (id) => {
        const shipment = get().shipments.find(
          (s) =>
            s.id === id ||
            s.shipmentId === id ||
            s.shipmentId === `SHP-${id}` ||
            s.orderId === id,
        );
        if (shipment) {
          set({ selectedShipment: shipment, panelOpen: true });
        }
      },

      closePanel: () => set({ selectedShipment: null, panelOpen: false }),

      openDialog: (type, shipmentId) => {
        const shipment = get().shipments.find((s) => s.id === shipmentId);
        set({
          dialogType: type,
          dialogShipmentId: shipmentId,
          selectedShipment: shipment ?? get().selectedShipment,
          panelOpen: shipment ? true : get().panelOpen,
          ewayForm: {
            invoiceNumber: shipment?.invoiceNumber ?? "",
            gstNumber: shipment?.gstNumber ?? "",
            vehicle: shipment?.vehicle ?? "",
            destination: shipment?.destinationWarehouse ?? "",
          },
          markDeliveredForm: {
            ...defaultMarkDeliveredForm,
            deliveryDate: new Date().toISOString().slice(0, 10),
          },
          uploadPodForm: defaultUploadPodForm,
        });
      },

      closeDialog: () =>
        set({
          dialogType: null,
          dialogShipmentId: null,
          ewayForm: defaultGenerateEwayForm,
          markDeliveredForm: defaultMarkDeliveredForm,
          uploadPodForm: defaultUploadPodForm,
        }),

      setEwayForm: (data) =>
        set((state) => ({
          ewayForm: { ...state.ewayForm, ...data },
        })),

      setMarkDeliveredForm: (data) =>
        set((state) => ({
          markDeliveredForm: { ...state.markDeliveredForm, ...data },
        })),

      setUploadPodForm: (data) =>
        set((state) => ({
          uploadPodForm: { ...state.uploadPodForm, ...data },
        })),

      generateInvoice: (shipmentId) => {
        const now = new Date().toISOString();
        set((state) => {
          const shipments = state.shipments.map((s) => {
            if (s.id !== shipmentId) return s;
            const invoiceNumber =
              s.invoiceNumber ?? `INV-2026-${Date.now().toString().slice(-4)}`;
            const documents = s.documents.map((d) =>
              d.type === "invoice"
                ? { ...d, status: "available" as const, uploadedAt: now }
                : d,
            );
            const timeline = rebuildTimeline(s.status, s.timeline);
            const invoiceStep = timeline.find(
              (t) => t.key === "invoice_generated",
            );
            if (invoiceStep && invoiceStep.status === "pending") {
              invoiceStep.status = "completed";
              invoiceStep.timestamp = now;
            }
            return {
              ...s,
              invoiceNumber,
              documents,
              timeline,
              updatedAt: now,
            };
          });
          return {
            shipments,
            selectedShipment: syncSelected(shipments, state.selectedShipment),
          };
        });
      },

      generateEway: (shipmentId) => {
        const form = get().ewayForm;
        const ewayBillNumber = `EWB-${Date.now().toString().slice(-8)}`;
        const now = new Date().toISOString();

        set((state) => {
          const shipments = state.shipments.map((s) => {
            if (s.id !== shipmentId) return s;
            const documents = s.documents.map((d) =>
              d.type === "eway_bill"
                ? { ...d, status: "available" as const, uploadedAt: now }
                : d,
            );
            return {
              ...s,
              ewayBillNumber,
              invoiceNumber: form.invoiceNumber || s.invoiceNumber,
              gstNumber: form.gstNumber || s.gstNumber,
              documents,
              updatedAt: now,
            };
          });
          return {
            shipments,
            selectedShipment: syncSelected(shipments, state.selectedShipment),
            dialogType: null,
            dialogShipmentId: null,
          };
        });

        mockPdf(`${ewayBillNumber}.pdf`);
        return { ewayBillNumber };
      },

      uploadPod: (shipmentId) => {
        const form = get().uploadPodForm;
        if (!form.file) {
          return { ok: false, reason: "Please select a file to upload" };
        }

        const now = new Date().toISOString();
        set((state) => {
          const shipments = state.shipments.map((s) => {
            if (s.id !== shipmentId) return s;
            const documents = s.documents.map((d) =>
              d.type === "pod"
                ? {
                    ...d,
                    status: "uploaded" as const,
                    uploadedAt: now,
                    fileName: form.file?.name ?? "pod.pdf",
                    sizeLabel: `${Math.round((form.file?.size ?? 0) / 1024)} KB`,
                  }
                : d,
            );
            return { ...s, documents, updatedAt: now };
          });
          return {
            shipments,
            selectedShipment: syncSelected(shipments, state.selectedShipment),
            dialogType: null,
            dialogShipmentId: null,
            uploadPodForm: defaultUploadPodForm,
          };
        });

        return { ok: true };
      },

      markDelivered: (shipmentId) => {
        const form = get().markDeliveredForm;
        if (!form.receiverName.trim()) {
          return { ok: false, reason: "Receiver name is required" };
        }

        const now = new Date().toISOString();
        const deliveryDate = form.deliveryDate
          ? new Date(form.deliveryDate).toISOString()
          : now;

        set((state) => {
          const shipments = state.shipments.map((s) => {
            if (s.id !== shipmentId) return s;
            const timeline = rebuildTimeline(
              "delivered",
              s.timeline,
              deliveryDate,
            );
            const documents = s.documents.map((d) =>
              d.type === "pod" && d.status === "missing"
                ? {
                    ...d,
                    status: "uploaded" as const,
                    uploadedAt: deliveryDate,
                  }
                : d,
            );
            return {
              ...s,
              status: "delivered" as const,
              isDelayed: false,
              deliveredAt: deliveryDate,
              receiverName: form.receiverName,
              deliveryNotes: form.deliveryNotes,
              timeline,
              documents,
              updatedAt: now,
            };
          });
          return {
            shipments,
            selectedShipment: syncSelected(shipments, state.selectedShipment),
            dialogType: null,
            dialogShipmentId: null,
            markDeliveredForm: defaultMarkDeliveredForm,
          };
        });

        return { ok: true };
      },

      refreshData: async () => {
        set({ isRefreshing: true });
        await new Promise((r) => setTimeout(r, 600));
        set({ isRefreshing: false });
      },

      exportCsv: () => {
        const rows = get().getFilteredShipments();
        const header =
          "Shipment ID,Order ID,Buyer,Product,Qty (MT),Vehicle,Transporter,Dispatch Date,Expected Delivery,Status";
        const lines = rows.map(
          (s) =>
            `${s.shipmentId},${s.orderId},"${s.buyerCompany}","${s.product}",${s.quantityMt},${s.vehicle},${s.transporter},${s.dispatchDate},${s.expectedDelivery},${s.status}`,
        );
        const blob = new Blob([[header, ...lines].join("\n")], {
          type: "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "shipments-export.csv";
        link.click();
        URL.revokeObjectURL(url);
      },

      downloadDocument: async (shipmentId, documentId) => {
        const shipment = get().shipments.find((s) => s.id === shipmentId);
        const doc = shipment?.documents.find((d) => d.id === documentId);
        if (!doc || doc.status === "pending" || doc.status === "missing") {
          return "failed";
        }
        await new Promise((r) => setTimeout(r, 400));
        mockPdf(`${doc.name}-${shipment?.shipmentId ?? "doc"}.pdf`);
        return "ok";
      },

      previewDocument: (shipmentId, documentId) => {
        const shipment = get().shipments.find((s) => s.id === shipmentId);
        const doc = shipment?.documents.find((d) => d.id === documentId);
        if (!doc || doc.status === "pending" || doc.status === "missing")
          return;
        window.open("", "_blank");
      },

      getFilteredShipments: () => {
        const { shipments, filters, activeTab } = get();
        const q = filters.search.trim().toLowerCase();

        return shipments.filter((s) => {
          if (!matchesTab(s, activeTab)) return false;

          if (q) {
            const haystack = [
              s.shipmentId,
              s.orderId,
              s.buyerCompany,
              s.product,
              s.vehicle,
            ]
              .join(" ")
              .toLowerCase();
            if (!haystack.includes(q)) return false;
          }

          if (
            filters.status !== "All Statuses" &&
            s.status !== filters.status
          ) {
            return false;
          }

          if (
            filters.location !== "All Locations" &&
            s.sourceWarehouse !== filters.location
          ) {
            return false;
          }

          if (
            filters.transporter !== "All Transporters" &&
            s.transporter !== filters.transporter
          ) {
            return false;
          }

          if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            if (new Date(s.dispatchDate) < from) return false;
          }

          if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            if (new Date(s.dispatchDate) > to) return false;
          }

          return true;
        });
      },

      getPaginatedShipments: () => {
        const filtered = get().getFilteredShipments();
        const { page, pageSize } = get();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getTabCounts: () => {
        const { shipments } = get();
        return {
          active: shipments.filter(
            (s) =>
              s.status === "ready_for_dispatch" ||
              s.status === "in_transit" ||
              s.status === "dispatched",
          ).length,
          pending: shipments.filter((s) => s.status === "pending").length,
          delayed: shipments.filter(
            (s) => s.status === "delayed" || s.isDelayed,
          ).length,
          completed: shipments.filter((s) => s.status === "delivered").length,
        };
      },

      getComputedSummary: () => computeShipmentSummary(get().shipments),

      getShipmentById: (id) =>
        get().shipments.find(
          (s) => s.id === id || s.shipmentId === id || s.orderId === id,
        ),
    }),
    { name: "shipment-store" },
  ),
);
