export type ShipmentStatus =
  | "ready_for_dispatch"
  | "in_transit"
  | "dispatched"
  | "delayed"
  | "delivered"
  | "pending";

export type ShipmentTab = "active" | "pending" | "delayed" | "completed";

export type WarehouseCode = "Hazira" | "Dahej" | "JNPT" | "Mundra" | "Kandla";

export type TimelineStepKey =
  | "order_accepted"
  | "payment_verified"
  | "invoice_generated"
  | "vehicle_assigned"
  | "loading_started"
  | "loading_completed"
  | "shipment_dispatched"
  | "reached_destination"
  | "delivered";

export type TimelineStepStatus = "completed" | "current" | "pending";

export type ShipmentDocumentType =
  "invoice" | "eway_bill" | "loading_slip" | "packing_list" | "pod";

export type ShipmentDocumentStatus =
  "available" | "pending" | "uploaded" | "missing";

export type ShipmentDialogType =
  | "generate_invoice"
  | "generate_eway"
  | "upload_pod"
  | "mark_delivered"
  | "preview_invoice"
  | null;

export interface ShipmentTimelineStep {
  key: TimelineStepKey;
  label: string;
  status: TimelineStepStatus;
  timestamp?: string;
  description?: string;
}

export interface ShipmentDocument {
  id: string;
  type: ShipmentDocumentType;
  name: string;
  sizeLabel: string;
  status: ShipmentDocumentStatus;
  mimeType: string;
  uploadedAt?: string;
  fileName?: string;
}

export interface VehicleDriverInfo {
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  transportCompany: string;
  driverAvatarInitials: string;
  capacityMt: number;
  currentLocation: string;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  orderId: string;
  buyerCompany: string;
  product: string;
  quantityMt: number;
  sourceWarehouse: WarehouseCode;
  sourceWarehouseLabel: string;
  destinationWarehouse: string;
  distanceKm: number;
  eta: string;
  vehicle: string;
  transporter: string;
  dispatchDate: string;
  expectedDelivery: string;
  status: ShipmentStatus;
  isDelayed: boolean;
  invoiceNumber?: string;
  gstNumber?: string;
  ewayBillNumber?: string;
  timeline: ShipmentTimelineStep[];
  documents: ShipmentDocument[];
  vehicleInfo: VehicleDriverInfo | null;
  deliveredAt?: string;
  receiverName?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentSummary {
  readyToDispatch: number;
  inTransit: number;
  deliveredThisMonth: number;
  delayed: number;
}

export interface ShipmentFilters {
  search: string;
  status: string;
  location: string;
  transporter: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface GenerateEwayFormData {
  invoiceNumber: string;
  gstNumber: string;
  vehicle: string;
  destination: string;
}

export interface MarkDeliveredFormData {
  deliveryDate: string;
  receiverName: string;
  receiverSignature: string;
  deliveryNotes: string;
}

export interface UploadPodFormData {
  file: File | null;
  previewUrl: string | null;
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  ready_for_dispatch: "Ready For Dispatch",
  in_transit: "In Transit",
  dispatched: "Dispatched",
  delayed: "Delayed",
  delivered: "Delivered",
  pending: "Pending",
};

export const SHIPMENT_TABS: { key: ShipmentTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "delayed", label: "Delayed" },
  { key: "completed", label: "Completed" },
];

export const SHIPMENT_STATUSES = [
  "All Statuses",
  "ready_for_dispatch",
  "in_transit",
  "dispatched",
  "delayed",
  "delivered",
  "pending",
] as const;

export const SHIPMENT_LOCATIONS = [
  "All Locations",
  "Hazira",
  "Dahej",
  "JNPT",
  "Mundra",
  "Kandla",
] as const;

export const SHIPMENT_TRANSPORTERS = [
  "All Transporters",
  "BlueDart Freight",
  "SafeHaul Transporters",
  "PetroMove Fleet",
  "Western Bulk Carriers",
  "Horizon Tankers",
  "Chevron Logistics",
] as const;

export const TIMELINE_STEP_LABELS: Record<TimelineStepKey, string> = {
  order_accepted: "Order Accepted",
  payment_verified: "Payment Verified",
  invoice_generated: "Invoice Generated",
  vehicle_assigned: "Vehicle Assigned",
  loading_started: "Loading Started",
  loading_completed: "Loading Completed",
  shipment_dispatched: "Shipment Dispatched",
  reached_destination: "Reached Destination",
  delivered: "Delivered",
};

export const defaultGenerateEwayForm: GenerateEwayFormData = {
  invoiceNumber: "",
  gstNumber: "",
  vehicle: "",
  destination: "",
};

export const defaultMarkDeliveredForm: MarkDeliveredFormData = {
  deliveryDate: new Date().toISOString().slice(0, 10),
  receiverName: "",
  receiverSignature: "",
  deliveryNotes: "",
};

export const defaultUploadPodForm: UploadPodFormData = {
  file: null,
  previewUrl: null,
};
