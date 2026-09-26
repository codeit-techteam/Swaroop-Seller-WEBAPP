/** Backend-aligned seller dispatch types (Phase 9 logistics). */

export type BackendDispatchStatus =
  | "DRAFT"
  | "PLANNED"
  | "AWAITING_VEHICLE"
  | "VEHICLE_ASSIGNED"
  | "AWAITING_EWAY_BILL"
  | "READY_FOR_DISPATCH"
  | "LOADING"
  | "LOADED"
  | "DISPATCHED"
  | "CANCELLED";

export type SellerDispatchTabFilter =
  "all" | "ready" | "scheduled" | "loading" | "dispatched";

export interface SellerDispatchBuyer {
  displayName: string;
  reference: string | null;
}

export interface SellerDispatchSlot {
  id: string;
  slotNumber: string | null;
  slotDate: string;
  startTime: string | null;
  endTime: string | null;
  timeSlot: string | null;
  loadingBay: string | null;
  status: string;
  label: string;
}

export interface SellerDispatchEwayBill {
  id: string;
  dispatchId: string;
  ewayBillNumber: string;
  status: string;
  generatedAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
  hasDocument: boolean;
  createdAt: string;
}

export interface SellerDispatchRecord {
  id: string;
  dispatchNumber: string;
  purchaseOrderId: string;
  purchaseOrderReference: string | null;
  status: BackendDispatchStatus;
  quantity: number;
  unit: string;
  gradeName: string | null;
  plannedDispatchDate: string | null;
  actualDispatchDate: string | null;
  loadingStartedAt: string | null;
  loadingCompletedAt: string | null;
  originWarehouseId: string | null;
  loadingLocation: string | null;
  warehouseName: string | null;
  warehouseCode: string | null;
  destinationRegion: string | null;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  transporterName: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehicleSlotId: string | null;
  slot: SellerDispatchSlot | null;
  slotLabel: string | null;
  buyer: SellerDispatchBuyer;
  ewayBillNumber: string | null;
  ewayBillStatus: string | null;
  ewayBills: SellerDispatchEwayBill[];
  shipmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerDispatchSummary {
  all: number;
  readyForDispatch: number;
  scheduled: number;
  loading: number;
  dispatched: number;
  byTab: Record<SellerDispatchTabFilter, number>;
}

export interface SellerDispatchListParams {
  page?: number;
  limit?: number;
  search?: string;
  tab?: Exclude<SellerDispatchTabFilter, "all"> | "all";
  dispatchStatus?: BackendDispatchStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SellerDispatchPage {
  items: SellerDispatchRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SellerDispatchTimelineEvent {
  id: string;
  eventType: string;
  actorRole: string | null;
  occurredAt: string;
  metadata?: unknown;
}

export interface AssignDispatchVehiclePayload {
  vehicleId: string;
  driverId?: string;
}

export interface UpsertDispatchEwayPayload {
  ewayBillNumber: string;
  validFrom?: string;
  validUntil?: string;
  documentKey?: string;
  documentId?: string;
}

export const DISPATCH_STATUS_LABELS: Record<BackendDispatchStatus, string> = {
  DRAFT: "Draft",
  PLANNED: "Planned",
  AWAITING_VEHICLE: "Awaiting Vehicle",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  AWAITING_EWAY_BILL: "Awaiting E-Way Bill",
  READY_FOR_DISPATCH: "Ready for Dispatch",
  LOADING: "Loading",
  LOADED: "Loaded",
  DISPATCHED: "Dispatched",
  CANCELLED: "Cancelled",
};

export const DISPATCH_TAB_EMPTY: Record<SellerDispatchTabFilter, string> = {
  all: "No dispatches found.",
  ready: "No dispatches are ready for dispatch.",
  scheduled: "No scheduled dispatches.",
  loading: "No dispatches currently loading.",
  dispatched: "No dispatched records found.",
};
