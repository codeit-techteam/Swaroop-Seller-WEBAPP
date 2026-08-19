import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { procurementQueueMock, procurementSummaryMock } from "@/mock/procurement";
import { BUYERS } from "@/modules/procurement/catalog";
import {
  defaultTimeline,
  hydrateProcurementItem,
  markTimeline,
  nextPoId,
  nextPrId,
  stageFromStatus,
} from "@/modules/procurement/selectors";
import { useAuthStore } from "@/store/authStore";
import type {
  CounterOfferInput,
  CreatePurchaseRequestInput,
  DispatchInput,
  ProcurementAttachment,
  ProcurementItem,
  ProcurementStatus,
  RejectionReason,
  SubmitQuoteInput,
} from "@/types/procurement";

const nowIso = () => new Date().toISOString();

function actor() {
  const user = useAuthStore.getState().user;
  if (user?.role === "SELLER") {
    return { name: user.name, kind: "SUPPLIER" as const, sellerId: user.sellerId };
  }
  return { name: user?.name ?? "Operations Admin", kind: "ADMIN" as const, sellerId: undefined };
}

function stamp(
  item: ProcurementItem,
  message: string,
  patch: Partial<ProcurementItem> = {},
): ProcurementItem {
  const at = nowIso();
  return {
    ...item,
    ...patch,
    activity: [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at,
        actor: actor().name,
        message,
      },
      ...item.activity,
    ],
  };
}

function matchId(item: ProcurementItem, id: string) {
  return (
    item.id === id ||
    item.requestId === id ||
    item.prId === id ||
    item.poId === id
  );
}

interface ProcurementState {
  items: ProcurementItem[];
  isLoading: boolean;
  hasError: boolean;
  createPurchaseRequest: (input: CreatePurchaseRequestInput) => string;
  updateItem: (id: string, patch: Partial<ProcurementItem>) => void;
  reviewRequest: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, reason: RejectionReason, remarks?: string) => void;
  assignSellers: (id: string, sellers: Array<{ id: string; name: string }>) => void;
  submitQuote: (id: string, input: SubmitQuoteInput) => void;
  selectSeller: (id: string, offerId: string) => void;
  startNegotiation: (id: string) => void;
  sendCounterOffer: (id: string, input: CounterOfferInput) => void;
  sellerCounterOffer: (id: string, input: CounterOfferInput) => void;
  acceptSupplierOffer: (id: string) => void;
  sellerAcceptPrice: (id: string) => void;
  rejectOffer: (id: string, offerId: string) => void;
  acceptOffer: (id: string, offerId: string) => void;
  requestQuoteRevision: (id: string, offerId: string) => void;
  finalizeNegotiation: (id: string) => void;
  sendBackApproval: (id: string, remarks: string) => void;
  approveProcurement: (id: string) => string;
  sendPurchaseOrder: (id: string) => void;
  acceptPurchaseOrder: (id: string, quantity: number, deliveryDate: string) => void;
  rejectPurchaseOrder: (id: string, reason: string) => void;
  requestPoChange: (id: string, reason: string) => void;
  recordDispatch: (id: string, input: DispatchInput) => void;
  markInTransit: (id: string) => void;
  markDelivered: (id: string) => void;
  completeOrder: (id: string) => void;
  addNote: (id: string, text: string) => void;
  addDocument: (id: string, name: string, kind: ProcurementAttachment["kind"]) => void;
  createPurchaseOrder: (id: string) => string;
  updateStatus: (id: string, status: ProcurementStatus) => void;
  retry: () => void;
}

export const useProcurementStore = create<ProcurementState>()(
  devtools(
    (set, get) => ({
      items: procurementQueueMock.map(hydrateProcurementItem),
      isLoading: false,
      hasError: false,
      createPurchaseRequest: (input) => {
        const requestId = nextPrId(get().items);
        const buyerMatch = BUYERS.find((row) => row.name === input.buyer);
        const buyerCompany = input.buyerCompany || buyerMatch?.company || input.buyer;
        const destination =
          input.destination || buyerMatch?.location || input.warehouse;
        const total = Math.round(input.quantity * input.unitPrice);
        const quantityMt =
          input.quantityUnit === "KG" ? input.quantity / 1000 : input.quantity;
        const at = nowIso();
        const status: ProcurementStatus = input.asDraft ? "DRAFT" : "NEW";
        const item: ProcurementItem = hydrateProcurementItem({
          id: requestId,
          requestId,
          prId: requestId,
          type: "PR",
          commodity: input.commodity,
          grade: input.grade,
          buyer: input.buyer,
          buyerCompany,
          buyerContact: "Buying desk",
          buyerEmail: "buying@buyer.com",
          supplier: input.supplier || "Unassigned",
          supplierId: input.supplierId,
          supplierContact: "Commercial desk",
          estimatedCost: total,
          unitPrice: input.unitPrice,
          negotiatedValue: total,
          quantityMt,
          quantityUnit: input.quantityUnit,
          status,
          stage: stageFromStatus(status),
          priority: input.priority,
          warehouse: input.warehouse,
          destination,
          paymentTerms: input.paymentTerms,
          creditTerms: input.creditTerms || (input.creditRequired ? "Net 30" : "Advance"),
          creditRequired: input.creditRequired,
          assignedTo: actor().name,
          owner: actor().name,
          createdAt: at,
          requestedDeliveryDate: input.requestedDeliveryDate,
          expectedCompletion: input.requestedDeliveryDate,
          processingHours: 0,
          description: input.reason,
          reason: input.reason,
          internalRemarks: input.internalRemarks,
          commission: Math.round(total * 0.005),
          deliveryCharges: 0,
          taxes: Math.round(total * 0.18),
          delayed: false,
          sellerStatus: input.supplierId ? "RFQ_SENT" : "UNASSIGNED",
          negotiationStatus: "NONE",
          assignedSellers: input.supplierId
            ? [
                {
                  supplierId: input.supplierId,
                  supplierName: input.supplier,
                  rfqSentAt: at,
                },
              ]
            : [],
          offers: [],
          negotiation: [],
          notes: input.notes
            ? [
                {
                  id: `note-${Date.now()}`,
                  text: input.notes,
                  author: actor().name,
                  createdAt: at,
                },
              ]
            : [],
          timeline: defaultTimeline(at, ["Created"]),
          activity: [
            {
              id: `act-${Date.now()}`,
              at,
              actor: actor().name,
              message: input.asDraft
                ? "Draft PR saved"
                : `Purchase Request ${requestId} created`,
            },
          ],
          documents: [],
        });
        set((state) => ({ items: [item, ...state.items] }));
        return requestId;
      },
      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchId(item, id) ? { ...item, ...patch } : item,
          ),
        })),
      reviewRequest: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, "PR reviewed by Operations Admin", {
              status: "UNDER_REVIEW",
              stage: "UNDER_REVIEW",
              timeline: markTimeline(item.timeline, "Under Review", at),
            });
          }),
        })),
      approveRequest: (id) => get().approveProcurement(id),
      rejectRequest: (id, reason, remarks) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, `Purchase Request rejected — ${reason}`, {
              status: "REJECTED",
              rejectionReason: reason,
              rejectionRemarks: remarks,
            });
          }),
        })),
      assignSellers: (id, sellers) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            const assignedSellers = sellers.map((seller) => ({
              supplierId: seller.id,
              supplierName: seller.name,
              rfqSentAt: at,
            }));
            return stamp(
              item,
              `RFQ sent to ${sellers.length} seller${sellers.length === 1 ? "" : "s"}`,
              {
                status: "SELLER_SOURCING",
                stage: "SELLER_SOURCING",
                sellerStatus: "RFQ_SENT",
                assignedSellers,
                supplier: sellers[0]?.name ?? item.supplier,
                supplierId: sellers[0]?.id ?? item.supplierId,
                timeline: markTimeline(item.timeline, "Seller Sourcing", at),
                documents: [
                  {
                    id: `rfq-${Date.now()}`,
                    name: `RFQ ${item.requestId}.pdf`,
                    kind: "RFQ",
                    uploadedAt: at,
                    visibleToSeller: true,
                  },
                  ...(item.documents ?? []),
                ],
              },
            );
          }),
        })),
      submitQuote: (id, input) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const current = actor();
            const sellerId = current.sellerId ?? item.supplierId;
            const sellerName = current.kind === "SUPPLIER" ? current.name : item.supplier;
            const at = nowIso();
            const existing = item.offers.find((offer) => offer.supplierId === sellerId);
            const offer = {
              id: existing?.id ?? `off-${Date.now()}`,
              supplierId: sellerId,
              supplierName: sellerName,
              unitPrice: input.unitPrice,
              quantity: item.quantityMt,
              availableQty: input.availableQty,
              delivery: `${input.deliveryDays} Days`,
              deliveryDays: input.deliveryDays,
              paymentTerms: input.paymentTerms,
              creditTerms: input.creditTerms,
              validity: input.validity,
              compliance: "VALID" as const,
              rating: 4.5,
              status: input.asDraft ? ("DRAFT" as const) : ("SUBMITTED" as const),
              moq: input.moq,
              contact: sellerName,
              dispatchLocation: input.dispatchLocation,
              remarks: input.remarks,
              submittedAt: at,
            };
            const offers = existing
              ? item.offers.map((row) => (row.supplierId === sellerId ? offer : row))
              : [...item.offers, offer];
            if (input.asDraft) {
              return stamp(item, "Quotation draft saved", { offers });
            }
            return stamp(item, `Quotation received from ${sellerName}`, {
              status: "QUOTATION_RECEIVED",
              stage: "QUOTATION",
              sellerStatus: "QUOTATION_RECEIVED",
              unitPrice: input.unitPrice,
              offers,
              timeline: markTimeline(item.timeline, "Quotation", at),
              documents: [
                {
                  id: `quote-${Date.now()}`,
                  name: `Quotation ${sellerName}.pdf`,
                  kind: "QUOTATION",
                  uploadedAt: at,
                  visibleToSeller: true,
                },
                ...(item.documents ?? []),
              ],
            });
          }),
        })),
      selectSeller: (id, offerId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const selected = item.offers.find((offer) => offer.id === offerId);
            if (!selected) return item;
            return stamp(item, `Seller selected: ${selected.supplierName}`, {
              selectedSellerId: selected.supplierId,
              supplier: selected.supplierName,
              supplierId: selected.supplierId,
              unitPrice: selected.unitPrice,
              negotiatedValue: Math.round(selected.unitPrice * item.quantityMt),
              paymentTerms: selected.paymentTerms,
              sellerStatus: "SELECTED",
              offers: item.offers.map((offer) => ({
                ...offer,
                status: offer.id === offerId ? "ACCEPTED" : offer.status,
              })),
            });
          }),
        })),
      startNegotiation: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, "Negotiation started", {
              status: "NEGOTIATION",
              stage: "NEGOTIATION",
              negotiationStatus: "ACTIVE",
              sellerStatus: "NEGOTIATING",
              timeline: markTimeline(item.timeline, "Negotiation", at),
            });
          }),
        })),
      sendCounterOffer: (id, input) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            const qty = input.quantity;
            const negotiatedValue = Math.round(input.unitPrice * qty);
            return stamp(item, `Admin counter offer ₹${input.unitPrice.toLocaleString("en-IN")}/MT`, {
              status: "NEGOTIATION",
              stage: "NEGOTIATION",
              negotiationStatus: "ACTIVE",
              unitPrice: input.unitPrice,
              negotiatedValue,
              negotiation: [
                ...item.negotiation,
                {
                  id: `neg-${Date.now()}`,
                  actor: "ADMIN",
                  actorName: actor().name,
                  unitPrice: input.unitPrice,
                  quantity: qty,
                  deliveryDate: input.deliveryDate,
                  paymentTerms: input.paymentTerms,
                  message: input.message || `Admin counter offer ₹${input.unitPrice}/MT`,
                  createdAt: at,
                },
              ],
            });
          }),
        })),
      sellerCounterOffer: (id, input) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            const current = actor();
            return stamp(item, `Seller counter offer ₹${input.unitPrice.toLocaleString("en-IN")}/MT`, {
              status: "NEGOTIATION",
              unitPrice: input.unitPrice,
              negotiatedValue: Math.round(input.unitPrice * input.quantity),
              negotiation: [
                ...item.negotiation,
                {
                  id: `neg-${Date.now()}`,
                  actor: "SUPPLIER",
                  actorName: current.name,
                  unitPrice: input.unitPrice,
                  quantity: input.quantity,
                  deliveryDate: input.deliveryDate,
                  paymentTerms: input.paymentTerms,
                  message: input.message || `Seller counter ₹${input.unitPrice}/MT`,
                  createdAt: at,
                },
              ],
            });
          }),
        })),
      acceptSupplierOffer: (id) => get().finalizeNegotiation(id),
      sellerAcceptPrice: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const lastAdmin = [...item.negotiation].reverse().find((row) => row.actor === "ADMIN");
            const unitPrice = lastAdmin?.unitPrice ?? item.unitPrice;
            return stamp(item, "Seller accepted negotiated price", {
              unitPrice,
              negotiatedValue: Math.round(unitPrice * item.quantityMt),
            });
          }),
        })),
      rejectOffer: (id, offerId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, "Offer rejected", {
              offers: item.offers.map((offer) =>
                offer.id === offerId ? { ...offer, status: "REJECTED" } : offer,
              ),
            });
          }),
        })),
      acceptOffer: (id, offerId) => {
        get().selectSeller(id, offerId);
        get().startNegotiation(id);
      },
      requestQuoteRevision: (id, offerId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, "Revision requested on quotation", {
              offers: item.offers.map((offer) =>
                offer.id === offerId
                  ? { ...offer, status: "REVISION_REQUESTED" }
                  : offer,
              ),
            });
          }),
        })),
      finalizeNegotiation: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const last = item.negotiation[item.negotiation.length - 1];
            const unitPrice = last?.unitPrice ?? item.unitPrice;
            const at = nowIso();
            return stamp(item, `Price finalized at ₹${unitPrice.toLocaleString("en-IN")}/MT`, {
              status: "APPROVAL_PENDING",
              stage: "APPROVAL",
              negotiationStatus: "COMPLETED",
              unitPrice,
              negotiatedValue: Math.round(unitPrice * item.quantityMt),
              timeline: markTimeline(item.timeline, "Approval", at),
            });
          }),
        })),
      sendBackApproval: (id, remarks) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, `Sent back for revision — ${remarks}`, {
              status: "NEGOTIATION",
              negotiationStatus: "ACTIVE",
              internalRemarks: remarks,
            });
          }),
        })),
      approveProcurement: (id) => {
        const poId = nextPoId(get().items);
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (!matchId(item, id) || item.type === "PO") return [item];
            const at = nowIso();
            const value = item.negotiatedValue || item.estimatedCost;
            const updatedPr = stamp(item, `Procurement approved. ${poId} created`, {
              status: "CONVERTED_TO_PO",
              poId,
              approvedAt: at,
              sellerStatus: "PO_ISSUED",
              timeline: markTimeline(
                markTimeline(item.timeline, "Approval", at),
                "PO Created",
                at,
              ),
            });
            const po: ProcurementItem = hydrateProcurementItem({
              ...updatedPr,
              id: poId,
              requestId: poId,
              prId: item.prId ?? item.requestId,
              poId,
              type: "PO",
              status: "CONVERTED_TO_PO",
              poStatus: "SENT_TO_SELLER",
              stage: "PO_CREATED",
              estimatedCost: value,
              negotiatedValue: value,
              sellerConfirmation: { status: "PENDING" },
              activity: [
                {
                  id: `act-po-${Date.now()}`,
                  at,
                  actor: actor().name,
                  message: `${poId} sent to ${item.supplier}`,
                },
                ...updatedPr.activity,
              ],
            });
            return [updatedPr, po];
          }),
        }));
        return poId;
      },
      sendPurchaseOrder: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, `PO sent to ${item.supplier}`, {
              poStatus: "SENT_TO_SELLER",
              type: item.type,
            });
          }),
        })),
      acceptPurchaseOrder: (id, quantity, deliveryDate) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, "Seller accepted PO and confirmed quantity / delivery", {
              poStatus: "CONFIRMED",
              quantityMt: quantity,
              requestedDeliveryDate: deliveryDate,
              sellerConfirmation: {
                status: "ACCEPTED",
                quantity,
                deliveryDate,
                at,
              },
              timeline: markTimeline(item.timeline, "Seller Confirmed", at),
            });
          }),
        })),
      rejectPurchaseOrder: (id, reason) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, `Seller rejected PO — ${reason}`, {
              poStatus: "REJECTED",
              sellerConfirmation: { status: "REJECTED", reason, at: nowIso() },
            });
          }),
        })),
      requestPoChange: (id, reason) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, `Seller requested PO change — ${reason}`, {
              poStatus: "SELLER_REVIEW",
              sellerConfirmation: {
                status: "CHANGE_REQUESTED",
                reason,
                at: nowIso(),
              },
            });
          }),
        })),
      recordDispatch: (id, input) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, `Dispatch recorded · LR ${input.lrNumber}`, {
              poStatus: "DISPATCHED",
              dispatch: { ...input, dispatchedAt: at },
              shipment: {
                trackingId: `TRK-${item.poId ?? item.id}`,
                carrier: input.vehicle,
                status: "DISPATCHED",
                eta: input.eta,
                updatedAt: at,
              },
              timeline: markTimeline(item.timeline, "Dispatched", at),
              documents: [
                {
                  id: `ship-${Date.now()}`,
                  name: `LR ${input.lrNumber}.pdf`,
                  kind: "SHIPPING",
                  uploadedAt: at,
                  visibleToSeller: true,
                },
                ...(item.documents ?? []),
              ],
            });
          }),
        })),
      markInTransit: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            return stamp(item, "Shipment in transit", {
              poStatus: "IN_TRANSIT",
              shipment: item.shipment
                ? { ...item.shipment, status: "IN_TRANSIT", updatedAt: nowIso() }
                : item.shipment,
            });
          }),
        })),
      markDelivered: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, "Delivery completed", {
              poStatus: "DELIVERED",
              shipment: item.shipment
                ? { ...item.shipment, status: "DELIVERED", updatedAt: at }
                : item.shipment,
              timeline: markTimeline(item.timeline, "Delivered", at),
            });
          }),
        })),
      completeOrder: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            const related =
              matchId(item, id) ||
              item.poId === id ||
              item.prId === id ||
              item.requestId === id;
            if (!related) return item;
            const at = nowIso();
            return stamp(item, "Procurement completed", {
              status: "COMPLETED",
              poStatus: item.type === "PO" ? "COMPLETED" : item.poStatus,
              stage: "COMPLETED",
              timeline: markTimeline(item.timeline, "Completed", at),
            });
          }),
        })),
      addNote: (id, text) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, "Internal note added", {
              notes: [
                {
                  id: `note-${Date.now()}`,
                  text,
                  author: actor().name,
                  createdAt: at,
                },
                ...item.notes,
              ],
            });
          }),
        })),
      addDocument: (id, name, kind) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (!matchId(item, id)) return item;
            const at = nowIso();
            return stamp(item, `Document uploaded: ${name}`, {
              documents: [
                {
                  id: `doc-${Date.now()}`,
                  name,
                  kind,
                  uploadedAt: at,
                  visibleToSeller: kind !== "COMMERCIAL",
                },
                ...(item.documents ?? []),
              ],
            });
          }),
        })),
      createPurchaseOrder: (id) => get().approveProcurement(id),
      updateStatus: (id, status) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchId(item, id)
              ? stamp(item, `Status moved to ${status.replaceAll("_", " ")}`, {
                  status,
                  stage: stageFromStatus(status),
                })
              : item,
          ),
        })),
      retry: () => set({ hasError: false, isLoading: false }),
    }),
    { name: "procurement-store" },
  ),
);

export { procurementSummaryMock };
