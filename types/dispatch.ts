export type DispatchStatus =
  | "ready_to_dispatch"
  | "vehicle_assigned"
  | "loading_in_progress"
  | "ready_for_release"
  | "dispatched"
  | "delivered"
  | "delayed";

export type DispatchTab =
  | "ready_to_dispatch"
  | "vehicle_assigned"
  | "loading_in_progress"
  | "ready_for_release"
  | "dispatched"
  | "delivered";

export type ChecklistItemKey =
  | "paymentVerified"
  | "invoiceGenerated"
  | "ewayGenerated"
  | "vehicleAssigned"
  | "loadingStarted"
  | "loadingCompleted"
  | "dispatchApproved";

export type ChecklistItemStatus = "completed" | "in_progress" | "pending";

export type DispatchDocumentType =
  "invoice" | "coa" | "loading_slip" | "packing_list" | "eway_bill";

export type ActivityType =
  | "vehicle_assigned"
  | "loading_started"
  | "gate_entry"
  | "loading_completed"
  | "shipment_released"
  | "eway_generated"
  | "dispatch_approved"
  | "note";

export type WarehouseCode = "Hazira" | "Mundra" | "JNPT" | "Dahej" | "Kandla";

export interface DispatchChecklistItem {
  key: ChecklistItemKey;
  label: string;
  status: ChecklistItemStatus;
  completedAt?: string;
}

export interface TransportInfo {
  vehicleNumber: string;
  driver: string;
  transportCompany: string;
  capacityMt: number;
  loadingBay: string;
  eta: string;
  estimatedDeparture: string;
}

export interface DispatchDocument {
  id: string;
  type: DispatchDocumentType;
  name: string;
  sizeLabel: string;
  available: boolean;
  mimeType: string;
}

export interface DispatchActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  status?: "success" | "info" | "warning";
}

export interface DispatchOrder {
  id: string;
  dispatchId: string;
  orderId: string;
  orderNumber: string;
  buyerCompany: string;
  material: string;
  materialGrade: string;
  quantityMt: number;
  destination: string;
  warehouse: WarehouseCode;
  warehouseLabel: string;
  deadline: string;
  deadlineLabel?: string;
  status: DispatchStatus;
  isDelayed: boolean;
  checklist: DispatchChecklistItem[];
  transport: TransportInfo | null;
  documents: DispatchDocument[];
  activity: DispatchActivity[];
  invoiceNumber?: string;
  gstNumber?: string;
  ewayBillNumber?: string;
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

/** @deprecated Use DispatchOrder */
export type DispatchRecord = DispatchOrder;

export interface DispatchSummary {
  readyForDispatch: number;
  vehiclePending: number;
  loading: number;
  dispatchedToday: number;
  deliveredToday: number;
  delayed: number;
}

export interface DispatchFilters {
  search: string;
  warehouse: string;
  status: string;
  destination: string;
  material: string;
}

export interface AssignVehicleFormData {
  vehicleNumber: string;
  driver: string;
  transportCompany: string;
  estimatedArrival: string;
  loadingBay: string;
  capacityMt: string;
}

export interface GenerateEwayFormData {
  invoiceNumber: string;
  gstNumber: string;
  destination: string;
}

export interface VehicleOption {
  id: string;
  number: string;
  capacityMt: number;
  type: string;
}

export interface DriverOption {
  id: string;
  name: string;
  phoneMasked: string;
}

export interface TransportCompanyOption {
  id: string;
  name: string;
}

export const DISPATCH_TABS: {
  key: DispatchTab;
  label: string;
}[] = [
  { key: "ready_to_dispatch", label: "Ready To Dispatch" },
  { key: "vehicle_assigned", label: "Vehicle Assigned" },
  { key: "loading_in_progress", label: "Loading In Progress" },
  { key: "ready_for_release", label: "Ready For Release" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

export const DISPATCH_STATUS_LABELS: Record<DispatchStatus, string> = {
  ready_to_dispatch: "Ready",
  vehicle_assigned: "Vehicle Pending",
  loading_in_progress: "Loading",
  ready_for_release: "Released",
  dispatched: "Dispatched",
  delivered: "Delivered",
  delayed: "Delayed",
};

export const DISPATCH_WAREHOUSES = [
  "All Warehouses",
  "Hazira",
  "Mundra",
  "JNPT",
  "Dahej",
  "Kandla",
] as const;

export const DISPATCH_STATUSES = [
  "All Statuses",
  "ready_to_dispatch",
  "vehicle_assigned",
  "loading_in_progress",
  "ready_for_release",
  "dispatched",
  "delivered",
  "delayed",
] as const;

export const DISPATCH_MATERIALS = [
  "All Materials",
  "Bitumen VG-30",
  "Furnace Oil",
  "Lubricants X-1",
  "HDPE Blow Molding",
  "PP Homopolymer",
  "LLDPE Film",
  "PVC Resin",
  "Base Oil SN-150",
] as const;

export const defaultAssignVehicleForm: AssignVehicleFormData = {
  vehicleNumber: "",
  driver: "",
  transportCompany: "",
  estimatedArrival: "",
  loadingBay: "",
  capacityMt: "",
};

export const defaultGenerateEwayForm: GenerateEwayFormData = {
  invoiceNumber: "",
  gstNumber: "",
  destination: "",
};

export const CHECKLIST_LABELS: Record<ChecklistItemKey, string> = {
  paymentVerified: "Payment Verified",
  invoiceGenerated: "Invoice Generated",
  ewayGenerated: "E-Way Bill Generated",
  vehicleAssigned: "Vehicle Assigned",
  loadingStarted: "Loading In Progress",
  loadingCompleted: "Loading Completed",
  dispatchApproved: "Dispatch Approved",
};
