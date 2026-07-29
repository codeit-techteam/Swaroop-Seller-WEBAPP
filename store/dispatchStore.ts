import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  computeDispatchSummary,
  dispatchesMock,
  driverOptionsMock,
  transportCompanyOptionsMock,
  vehicleOptionsMock,
} from "@/mock/dispatch";
import type {
  AssignVehicleFormData,
  DispatchFilters,
  DispatchOrder,
  DispatchStatus,
  DispatchSummary,
  DispatchTab,
  GenerateEwayFormData,
} from "@/types/dispatch";
import {
  defaultAssignVehicleForm,
  defaultGenerateEwayForm,
} from "@/types/dispatch";

type DialogType = "assign_vehicle" | "generate_eway" | "release" | null;

interface DispatchState {
  dispatches: DispatchOrder[];
  selectedDispatch: DispatchOrder | null;
  activeTab: DispatchTab;
  filters: DispatchFilters;
  page: number;
  pageSize: number;
  panelOpen: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
  dialogType: DialogType;
  dialogDispatchId: string | null;
  assignForm: AssignVehicleFormData;
  ewayForm: GenerateEwayFormData;

  setSearch: (search: string) => void;
  setFilter: <K extends keyof DispatchFilters>(
    key: K,
    value: DispatchFilters[K],
  ) => void;
  resetFilters: () => void;
  setActiveTab: (tab: DispatchTab) => void;
  setPage: (page: number) => void;
  selectDispatch: (dispatch: DispatchOrder) => void;
  selectDispatchById: (id: string) => void;
  closePanel: () => void;
  openDialog: (type: DialogType, dispatchId: string) => void;
  closeDialog: () => void;
  setAssignForm: (data: Partial<AssignVehicleFormData>) => void;
  setEwayForm: (data: Partial<GenerateEwayFormData>) => void;
  assignVehicle: (dispatchId: string) => void;
  generateEway: (dispatchId: string) => { ewayBillNumber: string };
  releaseShipment: (dispatchId: string) => { ok: boolean; reason?: string };
  refreshData: () => Promise<void>;
  exportCsv: () => void;
  downloadDocument: (
    dispatchId: string,
    documentId: string,
  ) => Promise<"ok" | "failed">;
  previewDocument: (dispatchId: string, documentId: string) => void;
  getFilteredDispatches: () => DispatchOrder[];
  getPaginatedDispatches: () => DispatchOrder[];
  getTabCounts: () => Record<DispatchTab, number>;
  getComputedSummary: () => DispatchSummary;
  getDispatchById: (id: string) => DispatchOrder | undefined;
  vehicleOptions: typeof vehicleOptionsMock;
  driverOptions: typeof driverOptionsMock;
  transportCompanyOptions: typeof transportCompanyOptionsMock;
}

const defaultFilters: DispatchFilters = {
  search: "",
  warehouse: "All Warehouses",
  status: "All Statuses",
  destination: "All Destinations",
  material: "All Materials",
};

function matchesTab(order: DispatchOrder, tab: DispatchTab): boolean {
  if (tab === "ready_to_dispatch") return order.status === "ready_to_dispatch";
  if (tab === "vehicle_assigned") return order.status === "vehicle_assigned";
  if (tab === "loading_in_progress")
    return order.status === "loading_in_progress";
  if (tab === "ready_for_release") return order.status === "ready_for_release";
  if (tab === "dispatched") {
    return order.status === "dispatched" || order.status === "delayed";
  }
  if (tab === "delivered") return order.status === "delivered";
  return true;
}

function syncSelected(
  dispatches: DispatchOrder[],
  selected: DispatchOrder | null,
): DispatchOrder | null {
  if (!selected) return null;
  return dispatches.find((d) => d.id === selected.id) ?? null;
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

export const useDispatchStore = create<DispatchState>()(
  devtools(
    (set, get) => ({
      dispatches: dispatchesMock,
      selectedDispatch: null,
      activeTab: "ready_to_dispatch",
      filters: defaultFilters,
      page: 1,
      pageSize: 8,
      panelOpen: false,
      isRefreshing: false,
      isLoading: false,
      dialogType: null,
      dialogDispatchId: null,
      assignForm: defaultAssignVehicleForm,
      ewayForm: defaultGenerateEwayForm,
      vehicleOptions: vehicleOptionsMock,
      driverOptions: driverOptionsMock,
      transportCompanyOptions: transportCompanyOptionsMock,

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

      selectDispatch: (dispatch) =>
        set({ selectedDispatch: dispatch, panelOpen: true }),

      selectDispatchById: (id) => {
        const dispatch = get().dispatches.find(
          (d) => d.id === id || d.dispatchId === id || d.orderId === id,
        );
        if (dispatch) {
          set({ selectedDispatch: dispatch, panelOpen: true });
        }
      },

      closePanel: () => set({ selectedDispatch: null, panelOpen: false }),

      openDialog: (type, dispatchId) => {
        const dispatch = get().dispatches.find((d) => d.id === dispatchId);
        set({
          dialogType: type,
          dialogDispatchId: dispatchId,
          selectedDispatch: dispatch ?? get().selectedDispatch,
          panelOpen: dispatch ? true : get().panelOpen,
          assignForm: dispatch?.transport
            ? {
                vehicleNumber: dispatch.transport.vehicleNumber,
                driver: dispatch.transport.driver,
                transportCompany: dispatch.transport.transportCompany,
                estimatedArrival: dispatch.transport.eta,
                loadingBay: dispatch.transport.loadingBay,
                capacityMt: String(dispatch.transport.capacityMt),
              }
            : defaultAssignVehicleForm,
          ewayForm: {
            invoiceNumber: dispatch?.invoiceNumber ?? "",
            gstNumber: dispatch?.gstNumber ?? "",
            destination: dispatch?.destination ?? "",
          },
        });
      },

      closeDialog: () =>
        set({
          dialogType: null,
          dialogDispatchId: null,
          assignForm: defaultAssignVehicleForm,
          ewayForm: defaultGenerateEwayForm,
        }),

      setAssignForm: (data) =>
        set((state) => ({
          assignForm: { ...state.assignForm, ...data },
        })),

      setEwayForm: (data) =>
        set((state) => ({
          ewayForm: { ...state.ewayForm, ...data },
        })),

      assignVehicle: (dispatchId) => {
        const form = get().assignForm;
        const now = new Date().toISOString();
        set((state) => {
          const dispatches = state.dispatches.map((d) => {
            if (d.id !== dispatchId) return d;
            const nextStatus: DispatchStatus =
              d.status === "ready_to_dispatch" ? "vehicle_assigned" : d.status;
            return {
              ...d,
              status: nextStatus,
              updatedAt: now,
              transport: {
                vehicleNumber: form.vehicleNumber,
                driver: form.driver,
                transportCompany: form.transportCompany,
                capacityMt: Number(form.capacityMt) || 40,
                loadingBay: form.loadingBay || "01",
                eta: form.estimatedArrival || "09:00 AM",
                estimatedDeparture: "12:00 PM",
              },
              checklist: d.checklist.map((item) =>
                item.key === "vehicleAssigned"
                  ? {
                      ...item,
                      status: "completed" as const,
                      completedAt: now,
                    }
                  : item,
              ),
              activity: [
                {
                  id: `act-assign-${Date.now()}`,
                  type: "vehicle_assigned" as const,
                  title: `Vehicle ${form.vehicleNumber} assigned`,
                  description: `Driver ${form.driver} · ${form.transportCompany}`,
                  timestamp: now,
                  status: "success" as const,
                },
                ...d.activity,
              ],
              documents: d.documents.map((doc) =>
                doc.type === "loading_slip" ? { ...doc, available: true } : doc,
              ),
            };
          });
          return {
            dispatches,
            selectedDispatch: syncSelected(dispatches, state.selectedDispatch),
            dialogType: null,
            dialogDispatchId: null,
            assignForm: defaultAssignVehicleForm,
          };
        });
      },

      generateEway: (dispatchId) => {
        const form = get().ewayForm;
        const now = new Date().toISOString();
        const ewayBillNumber = `EWB${String(Math.floor(880000 + Math.random() * 9999)).padStart(6, "0")}`;
        set((state) => {
          const dispatches = state.dispatches.map((d) => {
            if (d.id !== dispatchId) return d;
            return {
              ...d,
              updatedAt: now,
              invoiceNumber: form.invoiceNumber || d.invoiceNumber,
              gstNumber: form.gstNumber || d.gstNumber,
              ewayBillNumber,
              checklist: d.checklist.map((item) =>
                item.key === "ewayGenerated"
                  ? {
                      ...item,
                      status: "completed" as const,
                      completedAt: now,
                    }
                  : item,
              ),
              documents: d.documents.map((doc) =>
                doc.type === "eway_bill"
                  ? { ...doc, available: true, name: "E-Way Bill.pdf" }
                  : doc,
              ),
              activity: [
                {
                  id: `act-eway-${Date.now()}`,
                  type: "eway_generated" as const,
                  title: `E-Way Bill ${ewayBillNumber} generated`,
                  timestamp: now,
                  status: "success" as const,
                },
                ...d.activity,
              ],
            };
          });
          return {
            dispatches,
            selectedDispatch: syncSelected(dispatches, state.selectedDispatch),
            dialogType: null,
            dialogDispatchId: null,
            ewayForm: defaultGenerateEwayForm,
          };
        });
        mockPdf(`E-Way-Bill-${ewayBillNumber}.pdf`);
        return { ewayBillNumber };
      },

      releaseShipment: (dispatchId) => {
        const dispatch = get().dispatches.find((d) => d.id === dispatchId);
        if (!dispatch) return { ok: false, reason: "Dispatch not found" };

        const required: Array<(typeof dispatch.checklist)[number]["key"]> = [
          "paymentVerified",
          "invoiceGenerated",
          "ewayGenerated",
          "vehicleAssigned",
          "loadingCompleted",
        ];
        const incomplete = required.filter((key) => {
          const item = dispatch.checklist.find((c) => c.key === key);
          return !item || item.status !== "completed";
        });

        // Auto-complete loading if release is from ready_for_release or loading with vehicle
        const canForce =
          dispatch.status === "ready_for_release" ||
          (dispatch.status === "loading_in_progress" &&
            Boolean(dispatch.transport) &&
            dispatch.checklist.some(
              (c) => c.key === "ewayGenerated" && c.status === "completed",
            ));

        if (incomplete.length > 0 && !canForce) {
          return {
            ok: false,
            reason: `Complete checklist: ${incomplete.join(", ")}`,
          };
        }

        if (!dispatch.transport) {
          return { ok: false, reason: "Assign a vehicle before release" };
        }

        const ewayDone = dispatch.checklist.some(
          (c) => c.key === "ewayGenerated" && c.status === "completed",
        );
        if (!ewayDone && !canForce) {
          return { ok: false, reason: "Generate E-Way Bill before release" };
        }

        const now = new Date().toISOString();
        set((state) => {
          const dispatches = state.dispatches.map((d) => {
            if (d.id !== dispatchId) return d;
            return {
              ...d,
              status: "dispatched" as DispatchStatus,
              updatedAt: now,
              dispatchedAt: now,
              isDelayed: false,
              checklist: d.checklist.map((item) => ({
                ...item,
                status: "completed" as const,
                completedAt: item.completedAt ?? now,
              })),
              activity: [
                {
                  id: `act-release-${Date.now()}`,
                  type: "shipment_released" as const,
                  title: "Shipment released from terminal",
                  description: "Dispatch approved and gate cleared",
                  timestamp: now,
                  status: "success" as const,
                },
                ...d.activity,
              ],
            };
          });
          return {
            dispatches,
            selectedDispatch: syncSelected(dispatches, state.selectedDispatch),
            dialogType: null,
            dialogDispatchId: null,
          };
        });
        return { ok: true };
      },

      refreshData: async () => {
        set({ isRefreshing: true });
        await new Promise((resolve) => setTimeout(resolve, 800));
        const next = dispatchesMock.map((d) => ({
          ...d,
          checklist: d.checklist.map((c) => ({ ...c })),
          documents: d.documents.map((doc) => ({ ...doc })),
          activity: d.activity.map((a) => ({ ...a })),
          transport: d.transport ? { ...d.transport } : null,
        }));
        const selectedId = get().selectedDispatch?.id;
        set({
          dispatches: next,
          isRefreshing: false,
          page: 1,
          selectedDispatch: selectedId
            ? (next.find((d) => d.id === selectedId) ?? null)
            : null,
        });
      },

      exportCsv: () => {
        const rows = get().getFilteredDispatches();
        const headers = [
          "Dispatch ID",
          "Order ID",
          "Buyer",
          "Material",
          "Qty (MT)",
          "Destination",
          "Warehouse",
          "Deadline",
          "Status",
        ];
        const csvRows = rows.map((d) =>
          [
            d.dispatchId,
            d.orderNumber,
            `"${d.buyerCompany}"`,
            `"${d.material}"`,
            d.quantityMt.toFixed(1),
            `"${d.destination}"`,
            d.warehouse,
            d.deadline,
            d.status,
          ].join(","),
        );
        const csv = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `dispatch-queue-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },

      downloadDocument: async (dispatchId, documentId) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const dispatch = get().dispatches.find((d) => d.id === dispatchId);
        const doc = dispatch?.documents.find((d) => d.id === documentId);
        if (!doc || !doc.available) return "failed";
        mockPdf(doc.name);
        return "ok";
      },

      previewDocument: (dispatchId, documentId) => {
        const dispatch = get().dispatches.find((d) => d.id === dispatchId);
        const doc = dispatch?.documents.find((d) => d.id === documentId);
        if (!doc || !doc.available) return;
        const blob = new Blob(
          [`Preview: ${doc.name}\nDispatch: ${dispatch?.dispatchId}`],
          { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },

      getFilteredDispatches: () => {
        const { dispatches, filters, activeTab } = get();
        const query = filters.search.trim().toLowerCase();

        return dispatches.filter((item) => {
          if (!matchesTab(item, activeTab)) return false;

          const matchesSearch =
            !query ||
            item.orderNumber.toLowerCase().includes(query) ||
            item.orderId.toLowerCase().includes(query) ||
            item.dispatchId.toLowerCase().includes(query) ||
            item.buyerCompany.toLowerCase().includes(query) ||
            item.material.toLowerCase().includes(query) ||
            item.destination.toLowerCase().includes(query) ||
            (item.transport?.vehicleNumber.toLowerCase().includes(query) ??
              false) ||
            (item.transport?.driver.toLowerCase().includes(query) ?? false);

          const matchesWarehouse =
            filters.warehouse === "All Warehouses" ||
            item.warehouse === filters.warehouse;

          const matchesStatus =
            filters.status === "All Statuses" ||
            item.status === filters.status ||
            (filters.status === "delayed" && item.isDelayed);

          const matchesDestination =
            filters.destination === "All Destinations" ||
            item.destination === filters.destination;

          const matchesMaterial =
            filters.material === "All Materials" ||
            item.material === filters.material;

          return (
            matchesSearch &&
            matchesWarehouse &&
            matchesStatus &&
            matchesDestination &&
            matchesMaterial
          );
        });
      },

      getPaginatedDispatches: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredDispatches();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getTabCounts: () => {
        const { dispatches } = get();
        return {
          ready_to_dispatch: dispatches.filter(
            (d) => d.status === "ready_to_dispatch",
          ).length,
          vehicle_assigned: dispatches.filter(
            (d) => d.status === "vehicle_assigned",
          ).length,
          loading_in_progress: dispatches.filter(
            (d) => d.status === "loading_in_progress",
          ).length,
          ready_for_release: dispatches.filter(
            (d) => d.status === "ready_for_release",
          ).length,
          dispatched: dispatches.filter(
            (d) => d.status === "dispatched" || d.status === "delayed",
          ).length,
          delivered: dispatches.filter((d) => d.status === "delivered").length,
        };
      },

      getComputedSummary: () => computeDispatchSummary(get().dispatches),

      getDispatchById: (id) =>
        get().dispatches.find(
          (d) => d.id === id || d.dispatchId === id || d.orderId === id,
        ),
    }),
    { name: "dispatch-store" },
  ),
);

export { defaultFilters };
