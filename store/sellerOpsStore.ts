import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { OPS_WAREHOUSES } from "@/lib/mock/seller-ops";
import {
  canBookTimeSlot,
  kgValue,
  nextSlotId,
  nowIso,
  orderIdForPr,
  poNumberForPr,
  timeSlotAvailability,
} from "@/lib/seller-ops";
import { updatePriceRevision } from "@/services/priceRevisionService";
import { getSellerOpsBundle } from "@/services/procurementService";
import { bookVehicleSlot } from "@/services/vehicleSlotService";
import { useSellerOrderStore } from "@/store/sellerOrderStore";
import type {
  AlertKind,
  BookVehicleSlotInput,
  CounterOfferInput,
  OpsActivity,
  OpsTimelineStep,
  PriceRevision,
  ProcurementRecord,
  PurchaseRequest,
  VehicleSlot,
  VehicleSlotStatus,
} from "@/types/seller-ops";

function stamp(): string {
  return nowIso();
}

function activity(
  message: string,
  actor = "Seller Ops",
  at = stamp(),
): OpsActivity {
  return {
    id: `act-${Math.random().toString(36).slice(2, 10)}`,
    at,
    actor,
    message,
  };
}

function withAlerts(record: ProcurementRecord): ProcurementRecord {
  const alerts: AlertKind[] = [];
  const revision = record.currentStage === "PRICE_REVISION";
  if (revision && record.priority === "CRITICAL") {
    alerts.push("PRICE_REVISION_DUE_TODAY");
  }
  if (
    record.paymentStatus === "PAYMENT_PENDING" ||
    record.paymentStatus === "OVERDUE"
  ) {
    if (
      record.currentStage === "PAYMENT" ||
      record.currentStage === "PO" ||
      record.paymentStatus === "OVERDUE"
    ) {
      alerts.push("PAYMENT_PENDING");
    }
  }
  if (
    (record.currentStage === "DISPATCH" ||
      record.dispatchStatus === "READY_FOR_DISPATCH") &&
    record.paymentStatus === "PAID" &&
    !record.vehicleSlotId
  ) {
    alerts.push("VEHICLE_SLOT_MISSING");
  }
  if (record.currentStage === "PO" && !record.poAcknowledged) {
    alerts.push("PO_AWAITING_CONFIRMATION");
  }
  if (record.documentsMissing) alerts.push("DOCUMENTS_MISSING");
  if (record.delayed) alerts.push("DISPATCH_DELAYED");
  return { ...record, alerts, overdue: record.overdue || record.delayed };
}

function markTimeline(
  steps: OpsTimelineStep[],
  currentLabel: string,
  at = stamp(),
): OpsTimelineStep[] {
  let seen = false;
  return steps.map((step) => {
    if (step.label === currentLabel) {
      seen = true;
      return { ...step, status: "current", at, actor: step.actor ?? "Seller Ops" };
    }
    if (!seen) {
      return {
        ...step,
        status: "completed",
        at: step.at ?? at,
      };
    }
    return { ...step, status: "pending" };
  });
}

function syncDispatch(record: ProcurementRecord, slot?: VehicleSlot) {
  if (!record.orderId) return;
  const warehouse = OPS_WAREHOUSES.find(
    (item) => item.name === record.warehouseName,
  );
  const paidReady =
    record.paymentStatus === "PAID" &&
    (record.currentStage === "DISPATCH" ||
      record.currentStage === "PAYMENT" ||
      record.dispatchStatus === "READY_FOR_DISPATCH");
  if (!paidReady && !slot) return;

  const status = slot
    ? record.dispatchStatus === "DISPATCHED" ||
      record.dispatchStatus === "IN_TRANSIT"
      ? "dispatched"
      : "scheduled"
    : "ready";

  useSellerOrderStore.getState().upsertDispatch({
    id: `ops-dsp-${record.orderId}`,
    orderId: record.orderId,
    gradeName: record.gradeName,
    quantityMt: record.quantityMt,
    loadingLocation: record.warehouseName ?? record.deliveryLocation,
    locationId: warehouse?.locationId ?? "loc-chennai",
    vehicle: slot?.vehicleNumber,
    transporter: slot?.carrier,
    driver: slot?.driverName,
    scheduledDate: slot?.date ?? record.expectedDelivery,
    slot: slot?.timeSlot,
    buyerRef: record.buyerName,
    status,
  });
}

interface SellerOpsState {
  purchaseRequests: PurchaseRequest[];
  priceRevisions: PriceRevision[];
  vehicleSlots: VehicleSlot[];
  procurementRecords: ProcurementRecord[];
  loading: boolean;
  hydrating: boolean;
  error: string | null;
  busy: boolean;
  bootstrap: () => Promise<void>;
  retry: () => Promise<void>;
  acceptPr: (purchaseRequestId: string) => Promise<void>;
  rejectPr: (purchaseRequestId: string, reason: string) => Promise<void>;
  openPriceRevision: (purchaseRequestId: string) => string | null;
  markRevisionViewed: (revisionId: string) => void;
  acceptPriceRevision: (revisionId: string) => Promise<void>;
  rejectPriceRevision: (revisionId: string, reason: string) => Promise<void>;
  submitCounterOffer: (
    revisionId: string,
    input: CounterOfferInput,
  ) => Promise<void>;
  acknowledgePo: (recordId: string) => Promise<void>;
  confirmPayment: (recordId: string) => Promise<void>;
  bookVehicleSlot: (input: BookVehicleSlotInput) => Promise<VehicleSlot>;
  rescheduleVehicleSlot: (
    slotId: string,
    date: string,
    timeSlot: string,
    loadingBay: string,
  ) => Promise<void>;
  cancelVehicleSlot: (slotId: string, reason?: string) => Promise<void>;
  advanceSlotStatus: (
    slotId: string,
    status: Extract<
      VehicleSlotStatus,
      "ARRIVED" | "LOADING" | "COMPLETED"
    >,
  ) => Promise<void>;
  getRecordByPr: (purchaseRequestId: string) => ProcurementRecord | undefined;
  getRevisionById: (id: string) => PriceRevision | undefined;
  getSlotById: (id: string) => VehicleSlot | undefined;
}

export const useSellerOpsStore = create<SellerOpsState>()(
  devtools(
    (set, get) => ({
      purchaseRequests: [],
      priceRevisions: [],
      vehicleSlots: [],
      procurementRecords: [],
      loading: true,
      hydrating: false,
      error: null,
      busy: false,
      bootstrap: async () => {
        if (get().hydrating) return;
        if (get().procurementRecords.length > 0 && !get().error) {
          set({ loading: false });
          return;
        }
        set({ loading: true, hydrating: true, error: null });
        try {
          const bundle = await getSellerOpsBundle();
          set({
            purchaseRequests: bundle.purchaseRequests,
            priceRevisions: bundle.priceRevisions,
            vehicleSlots: bundle.vehicleSlots,
            procurementRecords: bundle.procurementRecords.map(withAlerts),
            loading: false,
            hydrating: false,
            error: null,
          });
        } catch {
          set({
            loading: false,
            hydrating: false,
            error: "Unable to load procurement data.",
          });
        }
      },
      retry: async () => {
        set({
          purchaseRequests: [],
          priceRevisions: [],
          vehicleSlots: [],
          procurementRecords: [],
          error: null,
        });
        await get().bootstrap();
      },
      acceptPr: async (purchaseRequestId) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        set((state) => ({
          busy: false,
          purchaseRequests: state.purchaseRequests.map((item) =>
            item.id === purchaseRequestId
              ? { ...item, status: "ACCEPTED" }
              : item,
          ),
          procurementRecords: state.procurementRecords.map((record) => {
            if (record.purchaseRequestId !== purchaseRequestId) return record;
            return withAlerts({
              ...record,
              currentStage: "COMMERCIAL_REVIEW",
              lastUpdated: at,
              timeline: markTimeline(
                record.timeline,
                "Commercial Negotiation",
                at,
              ),
              activity: [
                activity("Purchase request accepted.", "Seller Ops", at),
                ...record.activity,
              ],
            });
          }),
        }));
      },
      rejectPr: async (purchaseRequestId, reason) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        set((state) => ({
          busy: false,
          purchaseRequests: state.purchaseRequests.map((item) =>
            item.id === purchaseRequestId
              ? { ...item, status: "REJECTED" }
              : item,
          ),
          procurementRecords: state.procurementRecords.map((record) =>
            record.purchaseRequestId === purchaseRequestId
              ? withAlerts({
                  ...record,
                  lastUpdated: at,
                  activity: [
                    activity(`Purchase request rejected. ${reason}`, "Seller Ops", at),
                    ...record.activity,
                  ],
                })
              : record,
          ),
        }));
      },
      openPriceRevision: (purchaseRequestId) => {
        const existing = get().priceRevisions.find(
          (item) => item.purchaseRequestId === purchaseRequestId,
        );
        if (existing) return existing.id;
        const record = get().procurementRecords.find(
          (item) => item.purchaseRequestId === purchaseRequestId,
        );
        const pr = get().purchaseRequests.find(
          (item) => item.id === purchaseRequestId,
        );
        if (!record || !pr) return null;
        const id = `PRV-2026-${String(10000 + get().priceRevisions.length).slice(-5)}`;
        const at = stamp();
        const revision: PriceRevision = {
          id,
          purchaseRequestId,
          buyerId: pr.buyerId,
          buyerName: pr.buyerName,
          productId: pr.productId,
          productName: pr.productName,
          gradeId: pr.gradeId,
          gradeName: pr.gradeName,
          quantityMt: pr.quantityMt,
          originalPrice: pr.originalPrice,
          requestedPrice: pr.requestedPrice,
          totalValue: kgValue(pr.quantityMt, pr.requestedPrice),
          deliveryLocation: pr.deliveryLocation,
          requestedDelivery: pr.requestedDelivery,
          paymentTerms: pr.paymentTerms,
          reason: "Buyer requested revised commercial terms.",
          status: "PENDING",
          requestedOn: at,
          deadline: "2026-09-12T18:00:00.000Z",
          createdAt: at,
          updatedAt: at,
          activity: [
            activity("Price revision opened from purchase request.", "Seller Ops", at),
          ],
        };
        set((state) => ({
          priceRevisions: [revision, ...state.priceRevisions],
          procurementRecords: state.procurementRecords.map((item) =>
            item.id === record.id
              ? withAlerts({
                  ...item,
                  priceRevisionId: id,
                  currentStage: "PRICE_REVISION",
                  lastUpdated: at,
                  timeline: markTimeline(
                    item.timeline,
                    "Price Revision Pending",
                    at,
                  ),
                  activity: [
                    activity("Price revision opened.", "Seller Ops", at),
                    ...item.activity,
                  ],
                })
              : item,
          ),
        }));
        return id;
      },
      markRevisionViewed: (revisionId) => {
        const at = stamp();
        set((state) => ({
          priceRevisions: state.priceRevisions.map((item) =>
            item.id === revisionId && item.status === "PENDING"
              ? {
                  ...item,
                  status: "AWAITING_RESPONSE",
                  updatedAt: at,
                  activity: [
                    activity("Seller opened the revision for review.", "Seller Ops", at),
                    ...item.activity,
                  ],
                }
              : item,
          ),
        }));
      },
      acceptPriceRevision: async (revisionId) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        const revision = get().priceRevisions.find((item) => item.id === revisionId);
        if (!revision) {
          set({ busy: false });
          return;
        }
        const finalPrice =
          revision.counterPrice ?? revision.requestedPrice;
        const orderId = revision.orderId ?? orderIdForPr(revision.purchaseRequestId);
        const poNumber = poNumberForPr(revision.purchaseRequestId);
        const orderValue = kgValue(revision.quantityMt, finalPrice);

        set((state) => ({
          busy: false,
          purchaseRequests: state.purchaseRequests.map((item) =>
            item.id === revision.purchaseRequestId
              ? { ...item, status: "CONVERTED" }
              : item,
          ),
          priceRevisions: state.priceRevisions.map((item) =>
            item.id === revisionId
              ? {
                  ...item,
                  status: "ACCEPTED",
                  finalPrice,
                  orderId,
                  totalValue: orderValue,
                  updatedAt: at,
                  activity: [
                    activity(
                      `Price revision accepted at ₹${finalPrice}/kg.`,
                      "Seller Ops",
                      at,
                    ),
                    ...item.activity,
                  ],
                }
              : item,
          ),
          procurementRecords: state.procurementRecords.map((record) => {
            if (record.purchaseRequestId !== revision.purchaseRequestId) {
              return record;
            }
            return withAlerts({
              ...record,
              orderId,
              priceRevisionId: revisionId,
              currentStage: "PO",
              orderValue,
              lastUpdated: at,
              commercial: {
                ...record.commercial,
                finalPrice,
                counterPrice: revision.counterPrice,
              },
              order: {
                ...record.order,
                poNumber,
                orderNumber: orderId,
                orderStatus: "AWAITING_CONFIRMATION",
                quantityMt: revision.quantityMt,
              },
              payment: {
                ...record.payment,
                orderValue,
                amountPending: orderValue - record.payment.amountPaid,
              },
              timeline: markTimeline(record.timeline, "Purchase Order", at),
              activity: [
                activity(
                  `Final price accepted. PO ${poNumber} created.`,
                  "Seller Ops",
                  at,
                ),
                ...record.activity,
              ],
            });
          }),
        }));
      },
      rejectPriceRevision: async (revisionId, reason) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        const revision = get().priceRevisions.find((item) => item.id === revisionId);
        set((state) => ({
          busy: false,
          priceRevisions: state.priceRevisions.map((item) =>
            item.id === revisionId
              ? {
                  ...item,
                  status: "REJECTED",
                  rejectReason: reason,
                  updatedAt: at,
                  activity: [
                    activity(`Price revision rejected. ${reason}`, "Seller Ops", at),
                    ...item.activity,
                  ],
                }
              : item,
          ),
          procurementRecords: state.procurementRecords.map((record) =>
            revision && record.purchaseRequestId === revision.purchaseRequestId
              ? withAlerts({
                  ...record,
                  lastUpdated: at,
                  activity: [
                    activity("Price revision rejected.", "Seller Ops", at),
                    ...record.activity,
                  ],
                })
              : record,
          ),
        }));
      },
      submitCounterOffer: async (revisionId, input) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        const revision = get().priceRevisions.find((item) => item.id === revisionId);
        set((state) => ({
          busy: false,
          priceRevisions: state.priceRevisions.map((item) =>
            item.id === revisionId
              ? {
                  ...item,
                  status: "COUNTER_OFFER",
                  counterPrice: input.counterPrice,
                  counterReason: input.reason,
                  counterValidity: input.validity,
                  additionalTerms: input.additionalTerms,
                  updatedAt: at,
                  activity: [
                    activity(
                      `Seller submitted counter offer at ₹${input.counterPrice}/kg.`,
                      "Seller Ops",
                      at,
                    ),
                    ...item.activity,
                  ],
                }
              : item,
          ),
          procurementRecords: state.procurementRecords.map((record) =>
            revision && record.purchaseRequestId === revision.purchaseRequestId
              ? withAlerts({
                  ...record,
                  currentStage: "PRICE_REVISION",
                  lastUpdated: at,
                  commercial: {
                    ...record.commercial,
                    counterPrice: input.counterPrice,
                  },
                  activity: [
                    activity("Seller submitted counter offer.", "Seller Ops", at),
                    ...record.activity,
                  ],
                })
              : record,
          ),
        }));
      },
      acknowledgePo: async (recordId) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        set((state) => ({
          busy: false,
          procurementRecords: state.procurementRecords.map((record) => {
            if (record.id !== recordId) return record;
            const next = withAlerts({
              ...record,
              poAcknowledged: true,
              currentStage: "PAYMENT",
              lastUpdated: at,
              order: { ...record.order, orderStatus: "CONFIRMED" },
              timeline: markTimeline(record.timeline, "Payment", at),
              activity: [
                activity("Purchase order acknowledged.", "Seller Ops", at),
                ...record.activity,
              ],
            });
            return next;
          }),
        }));
      },
      confirmPayment: async (recordId) => {
        set({ busy: true });
        await updatePriceRevision(true);
        const at = stamp();
        let updated: ProcurementRecord | undefined;
        set((state) => ({
          busy: false,
          procurementRecords: state.procurementRecords.map((record) => {
            if (record.id !== recordId) return record;
            const next = withAlerts({
              ...record,
              paymentStatus: "PAID",
              currentStage: record.vehicleSlotId ? "DISPATCH" : "DISPATCH",
              dispatchStatus: "READY_FOR_DISPATCH",
              lastUpdated: at,
              overdue: false,
              order: {
                ...record.order,
                dispatchStatus: "READY_FOR_DISPATCH",
                orderStatus: "CONFIRMED",
              },
              payment: {
                ...record.payment,
                status: "PAID",
                amountPaid: record.orderValue,
                amountPending: 0,
              },
              timeline: markTimeline(record.timeline, "Dispatch", at),
              activity: [
                activity("Payment received. Order is ready for dispatch.", "Finance Desk", at),
                ...record.activity,
              ],
            });
            updated = next;
            return next;
          }),
        }));
        if (updated) {
          const slot = updated.vehicleSlotId
            ? get().vehicleSlots.find((item) => item.id === updated?.vehicleSlotId)
            : undefined;
          syncDispatch(updated, slot);
        }
      },
      bookVehicleSlot: async (input) => {
        const availability = timeSlotAvailability(
          input.warehouseId,
          input.date,
          input.timeSlot,
          get().vehicleSlots,
        );
        if (!canBookTimeSlot(availability)) {
          throw new Error("Selected time slot is not available.");
        }
        set({ busy: true });
        const warehouse = OPS_WAREHOUSES.find((item) => item.id === input.warehouseId);
        const at = stamp();
        const slot: VehicleSlot = {
          id: nextSlotId(get().vehicleSlots),
          orderId: input.orderId,
          purchaseRequestId: input.purchaseRequestId ?? "",
          warehouseId: input.warehouseId,
          warehouseName: warehouse?.name ?? "Warehouse",
          vehicleNumber: input.vehicleNumber.toUpperCase(),
          vehicleType: input.vehicleType,
          carrier: input.carrier,
          driverName: input.driverName,
          driverPhone: input.driverPhone,
          date: input.date,
          timeSlot: input.timeSlot,
          loadingBay: input.loadingBay,
          quantityMt: input.quantityMt,
          notes: input.notes,
          status: "BOOKED",
          createdAt: at,
          updatedAt: at,
          documents: [],
          timeline: [
            {
              id: "slot-req",
              label: "Slot Requested",
              status: "completed",
              at,
              actor: "Seller Ops",
            },
            {
              id: "slot-conf",
              label: "Slot Confirmed",
              status: "current",
              at,
              actor: "Seller Ops",
            },
            { id: "slot-arr", label: "Vehicle Arrived", status: "pending" },
            { id: "slot-load", label: "Loading Started", status: "pending" },
            { id: "slot-done", label: "Loading Completed", status: "pending" },
            { id: "slot-out", label: "Gate Out", status: "pending" },
          ],
        };
        await bookVehicleSlot(slot);
        let linked: ProcurementRecord | undefined;
        set((state) => ({
          busy: false,
          vehicleSlots: [slot, ...state.vehicleSlots],
          procurementRecords: state.procurementRecords.map((record) => {
            const matches =
              record.orderId === input.orderId ||
              record.purchaseRequestId === input.purchaseRequestId;
            if (!matches) return record;
            const next = withAlerts({
              ...record,
              vehicleSlotId: slot.id,
              delayed: false,
              lastUpdated: at,
              currentStage:
                record.paymentStatus === "PAID" ? "DISPATCH" : record.currentStage,
              dispatchStatus:
                record.paymentStatus === "PAID"
                  ? "READY_FOR_DISPATCH"
                  : record.dispatchStatus,
              warehouseName: slot.warehouseName,
              fulfillment: {
                ...record.fulfillment,
                vehicleSlotId: slot.id,
                dispatchDate: slot.date,
                vehicleNumber: slot.vehicleNumber,
              },
              order: {
                ...record.order,
                warehouseName: slot.warehouseName,
                dispatchStatus:
                  record.paymentStatus === "PAID"
                    ? "READY_FOR_DISPATCH"
                    : record.order.dispatchStatus,
              },
              activity: [
                activity(
                  `Vehicle slot ${slot.id} booked for ${slot.date} ${slot.timeSlot}.`,
                  "Logistics",
                  at,
                ),
                ...record.activity,
              ],
            });
            linked = next;
            return next;
          }),
        }));
        if (linked) syncDispatch(linked, slot);
        return slot;
      },
      rescheduleVehicleSlot: async (slotId, date, timeSlot, loadingBay) => {
        const current = get().vehicleSlots.find((item) => item.id === slotId);
        if (!current) return;
        const availability = timeSlotAvailability(
          current.warehouseId,
          date,
          timeSlot,
          get().vehicleSlots.filter((item) => item.id !== slotId),
        );
        if (!canBookTimeSlot(availability)) {
          throw new Error("Selected time slot is not available.");
        }
        set({ busy: true });
        await bookVehicleSlot(true);
        const at = stamp();
        set((state) => ({
          busy: false,
          vehicleSlots: state.vehicleSlots.map((slot) =>
            slot.id === slotId
              ? {
                  ...slot,
                  date,
                  timeSlot,
                  loadingBay,
                  updatedAt: at,
                  status: "BOOKED",
                }
              : slot,
          ),
          procurementRecords: state.procurementRecords.map((record) =>
            record.vehicleSlotId === slotId
              ? withAlerts({
                  ...record,
                  lastUpdated: at,
                  delayed: false,
                  fulfillment: {
                    ...record.fulfillment,
                    dispatchDate: date,
                  },
                  activity: [
                    activity(
                      `Vehicle slot rescheduled to ${date} ${timeSlot}.`,
                      "Logistics",
                      at,
                    ),
                    ...record.activity,
                  ],
                })
              : record,
          ),
        }));
        const updatedSlot = get().vehicleSlots.find((item) => item.id === slotId);
        const record = get().procurementRecords.find(
          (item) => item.vehicleSlotId === slotId,
        );
        if (record && updatedSlot) syncDispatch(record, updatedSlot);
      },
      cancelVehicleSlot: async (slotId, reason) => {
        set({ busy: true });
        await bookVehicleSlot(true);
        const at = stamp();
        set((state) => ({
          busy: false,
          vehicleSlots: state.vehicleSlots.map((slot) =>
            slot.id === slotId
              ? { ...slot, status: "CANCELLED", notes: reason, updatedAt: at }
              : slot,
          ),
          procurementRecords: state.procurementRecords.map((record) =>
            record.vehicleSlotId === slotId
              ? withAlerts({
                  ...record,
                  vehicleSlotId: undefined,
                  delayed: true,
                  lastUpdated: at,
                  fulfillment: {
                    ...record.fulfillment,
                    vehicleSlotId: undefined,
                    vehicleNumber: undefined,
                    dispatchDate: undefined,
                  },
                  activity: [
                    activity(
                      reason
                        ? `Vehicle slot cancelled. ${reason}`
                        : "Vehicle slot cancelled.",
                      "Logistics",
                      at,
                    ),
                    ...record.activity,
                  ],
                })
              : record,
          ),
        }));
      },
      advanceSlotStatus: async (slotId, status) => {
        set({ busy: true });
        await bookVehicleSlot(true);
        const at = stamp();
        const labelMap: Record<typeof status, string> = {
          ARRIVED: "Vehicle Arrived",
          LOADING: "Loading Started",
          COMPLETED: "Loading Completed",
        };
        set((state) => {
          const slots = state.vehicleSlots.map((slot) => {
            if (slot.id !== slotId) return slot;
            const timeline = markTimeline(slot.timeline, labelMap[status], at);
            const completed =
              status === "COMPLETED"
                ? markTimeline(timeline, "Gate Out", at).map((step) =>
                    step.label === "Gate Out" || step.label === "Loading Completed"
                      ? { ...step, status: "completed" as const, at }
                      : step,
                  )
                : timeline;
            return {
              ...slot,
              status,
              updatedAt: at,
              timeline: completed,
            };
          });
          const slot = slots.find((item) => item.id === slotId);
          return {
            busy: false,
            vehicleSlots: slots,
            procurementRecords: state.procurementRecords.map((record) => {
              if (record.vehicleSlotId !== slotId) return record;
              if (status !== "COMPLETED") {
                return withAlerts({
                  ...record,
                  lastUpdated: at,
                  activity: [
                    activity(`${labelMap[status]}.`, "Logistics", at),
                    ...record.activity,
                  ],
                });
              }
              const next = withAlerts({
                ...record,
                currentStage: "SHIPMENT",
                dispatchStatus: "IN_TRANSIT",
                lastUpdated: at,
                fulfillment: {
                  ...record.fulfillment,
                  shipmentId:
                    record.fulfillment.shipmentId ??
                    `SHP-${record.orderId ?? record.purchaseRequestId}`,
                  trackingStatus: "IN_TRANSIT",
                },
                order: { ...record.order, dispatchStatus: "IN_TRANSIT" },
                timeline: markTimeline(record.timeline, "Shipment", at),
                activity: [
                  activity("Loading completed. Shipment is in transit.", "Logistics", at),
                  ...record.activity,
                ],
              });
              if (slot) syncDispatch(next, slot);
              return next;
            }),
          };
        });
      },
      getRecordByPr: (purchaseRequestId) =>
        get().procurementRecords.find(
          (item) => item.purchaseRequestId === purchaseRequestId,
        ),
      getRevisionById: (id) =>
        get().priceRevisions.find((item) => item.id === id),
      getSlotById: (id) => get().vehicleSlots.find((item) => item.id === id),
    }),
    { name: "seller-ops-store" },
  ),
);
