/** Backend-aligned vehicle slot types (Phase 9 logistics). */

export type VehicleSlotStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ASSIGNED"
  | "CHECKED_IN"
  | "LOADING"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "MISSED";

export type LogisticsVehicleType =
  "TRAILER" | "TANKER" | "CONTAINER" | "TRUCK" | "TEMPO" | "OTHER";

export type SlotWindowAvailability =
  "AVAILABLE" | "BOOKED" | "FULL" | "BLOCKED";

export interface VehicleSlotBuyer {
  displayName: string;
  reference?: string | null;
}

export interface SellerVehicleSlot {
  id: string;
  slotNumber: string | null;
  warehouseId: string;
  warehouseName: string | null;
  warehouseCode: string | null;
  warehouseCity: string | null;
  dispatchId: string | null;
  dispatchNumber: string | null;
  orderId: string | null;
  purchaseOrderReference: string | null;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: LogisticsVehicleType | string | null;
  carrier: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  shipmentId: string | null;
  shipmentNumber: string | null;
  slotDate: string;
  startTime: string | null;
  endTime: string | null;
  timeSlot: string | null;
  loadingBay: string | null;
  status: VehicleSlotStatus;
  quantityMt: string | number | null;
  unit: string;
  destinationRegion: string | null;
  buyer: VehicleSlotBuyer | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSlotSummary {
  date: string;
  today: {
    total: number;
    booked: number;
    available: number;
    completed: number;
    cancelled: number;
  };
}

export interface VehicleSlotAvailabilityWindow {
  timeSlot: string;
  startTime: string;
  endTime: string;
  availability: SlotWindowAvailability;
  bays: Array<{
    loadingBay: string;
    availability: "AVAILABLE" | "BOOKED" | "BLOCKED";
    slotId: string | null;
  }>;
}

export interface VehicleSlotAvailability {
  warehouseId: string;
  date: string;
  loadingBays: string[];
  windows: VehicleSlotAvailabilityWindow[];
}

export interface LogisticsWarehouse {
  id: string;
  code: string;
  name: string;
  city?: string | null;
  state?: string | null;
  isPlatformHub?: boolean;
}

export interface LoadingBayOption {
  id: string;
  name: string;
}

export interface EligibleDispatch {
  id: string;
  dispatchNumber: string;
  purchaseOrderId: string;
  purchaseOrderReference: string | null;
  status: string;
  quantity: string;
  unit: string;
  originWarehouseId: string | null;
  destinationRegion: string | null;
  plannedDispatchDate: string | null;
  buyer: { displayName: string };
  paymentCleared: boolean;
}

export interface LogisticsVehicle {
  id: string;
  type: LogisticsVehicleType | string;
  numberPlate: string;
  transporterName: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  capacityMt: string | null;
  status: string;
  insuranceExpiry: string | null;
  fitnessExpiry: string | null;
  permitExpiry: string | null;
  pollutionExpiry: string | null;
  isActive: boolean;
}

export interface LogisticsDriver {
  id: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  status: string;
}

export interface VehicleSlotListParams {
  page?: number;
  limit?: number;
  status?: VehicleSlotStatus | "all";
  warehouseId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  vehicleType?: LogisticsVehicleType | "all";
  carrier?: string;
  orderId?: string;
  dispatchId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface VehicleSlotPage {
  items: SellerVehicleSlot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookVehicleSlotPayload {
  dispatchId: string;
  warehouseId: string;
  vehicleId: string;
  driverId: string;
  slotDate: string;
  timeSlot: string;
  loadingBay: string;
  quantityMt: number;
  startTime?: string;
  endTime?: string;
}

export const VEHICLE_SLOT_STATUSES: VehicleSlotStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "ASSIGNED",
  "CHECKED_IN",
  "LOADING",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "MISSED",
];

export const LOGISTICS_VEHICLE_TYPES: LogisticsVehicleType[] = [
  "TRAILER",
  "TANKER",
  "CONTAINER",
  "TRUCK",
  "TEMPO",
  "OTHER",
];
