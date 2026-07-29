import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { computeSlotSummary, slotsMock } from "@/mock/slot-booking";
import type {
  ModifySlotFormData,
  SlotBooking,
  SlotBookingFilters,
  SlotBookingSummary,
  SlotStatus,
} from "@/types/slot-booking";
import { defaultModifySlotForm } from "@/types/slot-booking";

type DialogType = "modify" | "cancel" | null;

interface SlotBookingState {
  slots: SlotBooking[];
  selectedSlot: SlotBooking | null;
  filters: SlotBookingFilters;
  appliedFilters: SlotBookingFilters;
  page: number;
  pageSize: number;
  panelOpen: boolean;
  isRefreshing: boolean;
  dialogType: DialogType;
  dialogSlotId: string | null;
  modifyForm: ModifySlotFormData;

  setSearch: (search: string) => void;
  setFilterDraft: <K extends keyof SlotBookingFilters>(
    key: K,
    value: SlotBookingFilters[K],
  ) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  selectSlot: (slot: SlotBooking) => void;
  closePanel: () => void;
  openDialog: (type: DialogType, slotId: string) => void;
  closeDialog: () => void;
  setModifyForm: (data: Partial<ModifySlotFormData>) => void;
  modifySlot: (slotId: string) => void;
  cancelSlot: (slotId: string) => void;
  downloadGatePass: (slotId: string) => Promise<"ok" | "failed">;
  refreshData: () => Promise<void>;
  getFilteredSlots: () => SlotBooking[];
  getPaginatedSlots: () => SlotBooking[];
  getComputedSummary: () => SlotBookingSummary;
  getSlotById: (id: string) => SlotBooking | undefined;
}

const defaultFilters: SlotBookingFilters = {
  search: "",
  warehouse: "All Warehouses",
  dispatchDate: "",
  shift: "all",
  vehicleType: "All Types",
};

function syncSelected(
  slots: SlotBooking[],
  selected: SlotBooking | null,
): SlotBooking | null {
  if (!selected) return null;
  return slots.find((s) => s.id === selected.id) ?? null;
}

function mockPdf(name: string, body: string): void {
  const content = `%PDF-1.4
Gate Pass
${body}
`;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export const useSlotBookingStore = create<SlotBookingState>()(
  devtools(
    (set, get) => ({
      slots: slotsMock,
      selectedSlot: null,
      filters: defaultFilters,
      appliedFilters: defaultFilters,
      page: 1,
      pageSize: 8,
      panelOpen: false,
      isRefreshing: false,
      dialogType: null,
      dialogSlotId: null,
      modifyForm: defaultModifySlotForm,

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          appliedFilters: { ...state.appliedFilters, search },
          page: 1,
        })),

      setFilterDraft: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      applyFilters: () =>
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

      setPage: (page) => set({ page }),

      selectSlot: (slot) => set({ selectedSlot: slot, panelOpen: true }),

      closePanel: () => set({ selectedSlot: null, panelOpen: false }),

      openDialog: (type, slotId) => {
        const slot = get().slots.find((s) => s.id === slotId);
        set({
          dialogType: type,
          dialogSlotId: slotId,
          selectedSlot: slot ?? get().selectedSlot,
          panelOpen: slot ? true : get().panelOpen,
          modifyForm: slot
            ? {
                dispatchDate: slot.dispatchDate,
                timeSlot: slot.timeSlot,
                warehouse: slot.warehouse,
                loadingBay: slot.bay,
                vehicleNumber: slot.vehicleNumber,
                driver: slot.driver,
              }
            : defaultModifySlotForm,
        });
      },

      closeDialog: () =>
        set({
          dialogType: null,
          dialogSlotId: null,
          modifyForm: defaultModifySlotForm,
        }),

      setModifyForm: (data) =>
        set((state) => ({
          modifyForm: { ...state.modifyForm, ...data },
        })),

      modifySlot: (slotId) => {
        const form = get().modifyForm;
        const now = new Date().toISOString();
        set((state) => {
          const slots = state.slots.map((s) => {
            if (s.id !== slotId) return s;
            const warehouseLabel = form.warehouse
              ? `${form.warehouse} - Bay ${form.loadingBay || s.bay}`
              : s.warehouseLabel;
            return {
              ...s,
              dispatchDate: form.dispatchDate || s.dispatchDate,
              timeSlot: form.timeSlot || s.timeSlot,
              warehouse: form.warehouse || s.warehouse,
              warehouseLabel,
              bay: form.loadingBay || s.bay,
              vehicleNumber: form.vehicleNumber || s.vehicleNumber,
              driver: form.driver || s.driver,
              updatedAt: now,
              status:
                s.status === "awaiting"
                  ? ("confirmed" as SlotStatus)
                  : s.status,
            };
          });
          return {
            slots,
            selectedSlot: syncSelected(slots, state.selectedSlot),
            dialogType: null,
            dialogSlotId: null,
            modifyForm: defaultModifySlotForm,
          };
        });
      },

      cancelSlot: (slotId) => {
        const now = new Date().toISOString();
        set((state) => {
          const slots = state.slots.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  status: "cancelled" as SlotStatus,
                  updatedAt: now,
                  timeline: s.timeline.map((step) =>
                    step.status === "current"
                      ? { ...step, status: "pending" as const }
                      : step,
                  ),
                }
              : s,
          );
          return {
            slots,
            selectedSlot: syncSelected(slots, state.selectedSlot),
            dialogType: null,
            dialogSlotId: null,
          };
        });
      },

      downloadGatePass: async (slotId) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const slot = get().slots.find((s) => s.id === slotId);
        if (!slot || slot.status === "cancelled") return "failed";
        mockPdf(
          `Gate-Pass-${slot.slotId.replace("#", "")}.pdf`,
          `${slot.slotId} | ${slot.vehicleNumber} | ${slot.warehouseLabel}`,
        );
        return "ok";
      },

      refreshData: async () => {
        set({ isRefreshing: true });
        await new Promise((resolve) => setTimeout(resolve, 700));
        const next = slotsMock.map((s) => ({
          ...s,
          checklist: { ...s.checklist },
          documents: s.documents.map((d) => ({ ...d })),
          timeline: s.timeline.map((t) => ({ ...t })),
        }));
        const selectedId = get().selectedSlot?.id;
        set({
          slots: next,
          isRefreshing: false,
          page: 1,
          selectedSlot: selectedId
            ? (next.find((s) => s.id === selectedId) ?? null)
            : null,
        });
      },

      getFilteredSlots: () => {
        const { slots, appliedFilters } = get();
        const query = appliedFilters.search.trim().toLowerCase();

        return slots.filter((item) => {
          const matchesSearch =
            !query ||
            item.slotId.toLowerCase().includes(query) ||
            item.purchaseRequestId.toLowerCase().includes(query) ||
            item.vehicleNumber.toLowerCase().includes(query) ||
            item.driver.toLowerCase().includes(query) ||
            item.material.toLowerCase().includes(query) ||
            item.warehouseLabel.toLowerCase().includes(query);

          const matchesWarehouse =
            appliedFilters.warehouse === "All Warehouses" ||
            item.warehouse === appliedFilters.warehouse;

          const matchesDate =
            !appliedFilters.dispatchDate ||
            item.dispatchDate === appliedFilters.dispatchDate;

          const matchesShift =
            appliedFilters.shift === "all" ||
            item.shift === appliedFilters.shift;

          const matchesType =
            appliedFilters.vehicleType === "All Types" ||
            item.vehicleType === appliedFilters.vehicleType;

          return (
            matchesSearch &&
            matchesWarehouse &&
            matchesDate &&
            matchesShift &&
            matchesType
          );
        });
      },

      getPaginatedSlots: () => {
        const { page, pageSize } = get();
        const filtered = get().getFilteredSlots();
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },

      getComputedSummary: () => computeSlotSummary(get().slots),

      getSlotById: (id) => get().slots.find((s) => s.id === id),
    }),
    { name: "slot-booking-store" },
  ),
);

export { defaultFilters as defaultSlotFilters };
