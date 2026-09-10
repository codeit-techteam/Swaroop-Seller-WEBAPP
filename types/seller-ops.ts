export type OpsStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "AWAITING_RESPONSE"
  | "COUNTER_OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "CONFIRMED"
  | "BOOKED"
  | "AVAILABLE"
  | "FULL"
  | "BLOCKED"
  | "CANCELLED"
  | "COMPLETED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "PAYMENT_PENDING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "SETTLEMENT_PENDING"
  | "SETTLED"
  | "NOT_STARTED"
  | "OVERDUE"
  | "MISSING";

export type PriceRevisionStatus =
  | "PENDING"
  | "AWAITING_RESPONSE"
  | "COUNTER_OFFER"
  | "ACCEPTED"
  | "REJECTED";

export type VehicleSlotStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "FULL"
  | "BLOCKED"
  | "CANCELLED"
  | "COMPLETED"
  | "ARRIVED"
  | "LOADING";

export type TimeSlotAvailability = "AVAILABLE" | "BOOKED" | "FULL" | "BLOCKED";

export type ProcurementStage =
  | "PR"
  | "COMMERCIAL_REVIEW"
  | "PRICE_REVISION"
  | "PO"
  | "PAYMENT"
  | "DISPATCH"
  | "SHIPMENT"
  | "SETTLEMENT";

export type ProcurementPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type PaymentStatus =
  | "PAYMENT_PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE";

export type DispatchStatus =
  | "NOT_STARTED"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED";

export type SettlementStatus = "SETTLEMENT_PENDING" | "SETTLED";

export type PaymentMethod =
  | "Advance"
  | "Credit"
  | "On Loading"
  | "LC"
  | "Other";

export type VehicleType = "Trailer" | "Tanker" | "Container" | "Truck" | "Tempo";

export type AlertKind =
  | "PRICE_REVISION_DUE_TODAY"
  | "PAYMENT_PENDING"
  | "VEHICLE_SLOT_MISSING"
  | "PO_AWAITING_CONFIRMATION"
  | "DOCUMENTS_MISSING"
  | "DISPATCH_DELAYED";

export type TimelineStepStatus = "completed" | "current" | "pending";

export interface CatalogBuyer {
  id: string;
  name: string;
  city: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
}

export interface CatalogGrade {
  id: string;
  productId: string;
  name: string;
}

export interface CatalogWarehouse {
  id: string;
  name: string;
  city: string;
  locationId: string;
}

export interface OpsActivity {
  id: string;
  at: string;
  actor: string;
  message: string;
}

export interface OpsTimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
  at?: string;
  actor?: string;
  action?: string;
}

export interface OpsDocument {
  id: string;
  name: string;
  kind:
    | "Purchase Order"
    | "Proforma Invoice"
    | "Tax Invoice"
    | "E-way Bill"
    | "Transport Document"
    | "Other";
  uploadedAt?: string;
  available: boolean;
}

export interface PurchaseRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  gradeId: string;
  gradeName: string;
  quantityMt: number;
  requestedPrice: number;
  originalPrice: number;
  status: "OPEN" | "ACCEPTED" | "REJECTED" | "CONVERTED";
  priority: ProcurementPriority;
  deliveryLocation: string;
  requestedDelivery: string;
  paymentTerms: PaymentMethod;
  createdAt: string;
}

export interface PriceRevision {
  id: string;
  purchaseRequestId: string;
  orderId?: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  gradeId: string;
  gradeName: string;
  quantityMt: number;
  originalPrice: number;
  requestedPrice: number;
  counterPrice?: number;
  finalPrice?: number;
  totalValue: number;
  deliveryLocation: string;
  requestedDelivery: string;
  paymentTerms: PaymentMethod;
  reason: string;
  counterReason?: string;
  counterValidity?: string;
  additionalTerms?: string;
  rejectReason?: string;
  status: PriceRevisionStatus;
  requestedOn: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  activity: OpsActivity[];
}

export interface VehicleSlot {
  id: string;
  orderId: string;
  purchaseRequestId: string;
  warehouseId: string;
  warehouseName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  carrier: string;
  driverName: string;
  driverPhone: string;
  date: string;
  timeSlot: string;
  loadingBay: string;
  quantityMt: number;
  notes?: string;
  status: VehicleSlotStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OpsTimelineStep[];
  documents: OpsDocument[];
}

export interface CommercialTerms {
  originalPrice: number;
  requestedPrice: number;
  counterPrice?: number;
  finalPrice?: number;
  paymentTerms: PaymentMethod;
  deliveryTerms: string;
}

export interface OrderSnapshot {
  poNumber?: string;
  orderNumber?: string;
  orderStatus?: string;
  quantityMt: number;
  warehouseName?: string;
  dispatchStatus: DispatchStatus;
}

export interface PaymentSnapshot {
  method: PaymentMethod;
  status: PaymentStatus;
  amountPaid: number;
  amountPending: number;
  dueDate: string;
  orderValue: number;
}

export interface FulfillmentSnapshot {
  vehicleSlotId?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  shipmentId?: string;
  trackingStatus?: DispatchStatus;
}

export interface ProcurementRecord {
  id: string;
  purchaseRequestId: string;
  orderId?: string;
  priceRevisionId?: string;
  vehicleSlotId?: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  gradeId: string;
  gradeName: string;
  quantityMt: number;
  currentStage: ProcurementStage;
  orderValue: number;
  paymentStatus: PaymentStatus;
  dispatchStatus: DispatchStatus;
  settlementStatus?: SettlementStatus;
  priority: ProcurementPriority;
  deliveryLocation: string;
  expectedDelivery: string;
  warehouseName?: string;
  paymentTerms: PaymentMethod;
  lastUpdated: string;
  overdue: boolean;
  delayed: boolean;
  poAcknowledged: boolean;
  documentsMissing: boolean;
  commercial: CommercialTerms;
  order: OrderSnapshot;
  payment: PaymentSnapshot;
  fulfillment: FulfillmentSnapshot;
  documents: OpsDocument[];
  timeline: OpsTimelineStep[];
  activity: OpsActivity[];
  alerts: AlertKind[];
}

export interface BookVehicleSlotInput {
  orderId: string;
  purchaseRequestId?: string;
  warehouseId: string;
  quantityMt: number;
  vehicleType: VehicleType;
  vehicleNumber: string;
  carrier: string;
  driverName: string;
  driverPhone: string;
  date: string;
  timeSlot: string;
  loadingBay: string;
  notes?: string;
}

export interface CounterOfferInput {
  counterPrice: number;
  reason: string;
  validity: string;
  additionalTerms?: string;
}

export interface SellerOpsBundle {
  purchaseRequests: PurchaseRequest[];
  priceRevisions: PriceRevision[];
  vehicleSlots: VehicleSlot[];
  procurementRecords: ProcurementRecord[];
}

export const PROCUREMENT_PIPELINE: {
  stage: ProcurementStage;
  label: string;
}[] = [
  { stage: "PR", label: "PR" },
  { stage: "COMMERCIAL_REVIEW", label: "Commercial" },
  { stage: "PRICE_REVISION", label: "Price Revision" },
  { stage: "PO", label: "PO" },
  { stage: "PAYMENT", label: "Payment" },
  { stage: "DISPATCH", label: "Dispatch" },
  { stage: "SHIPMENT", label: "Shipment" },
  { stage: "SETTLEMENT", label: "Settlement" },
];

export const TIME_SLOT_OPTIONS = [
  "08:00–09:00",
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–13:00",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00",
] as const;

export const LOADING_BAYS = [
  "Bay 01",
  "Bay 02",
  "Bay 03",
  "Bay 04",
  "Bay 05",
] as const;

export const VEHICLE_TYPES: VehicleType[] = [
  "Trailer",
  "Tanker",
  "Container",
  "Truck",
  "Tempo",
];

export const COUNTER_VALIDITY_OPTIONS = [
  "24 hours",
  "3 days",
  "7 days",
  "15 days",
] as const;
