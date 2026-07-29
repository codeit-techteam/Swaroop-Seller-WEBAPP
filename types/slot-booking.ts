export type SlotStatus =
  | "awaiting"
  | "confirmed"
  | "checked_in"
  | "loading"
  | "completed"
  | "cancelled";

export type SlotShift = "morning" | "afternoon" | "night";

export type VehicleType = "Tanker" | "Trailer" | "Container" | "Flatbed";

export type SlotDocStatus = "uploaded" | "missing" | "verified";

export type SlotDocType =
  "rc_book" | "insurance" | "driver_license" | "gate_pass" | "loading_slip";

export type BookingTimelineStepKey =
  | "procurement_approved"
  | "inventory_reserved"
  | "vehicle_assigned"
  | "slot_booked"
  | "gate_entry"
  | "loading_started"
  | "loading_completed"
  | "shipment_released";

export type BookingTimelineStepStatus = "completed" | "current" | "pending";

export type WarehouseCode = "Hazira" | "Mundra" | "JNPT" | "Dahej" | "Kandla";

export interface SlotChecklist {
  securityVerified: boolean;
  weighbridgeReady: boolean;
  gateEntry: boolean;
  loadingApproved: boolean;
}

export interface SlotDocument {
  id: string;
  type: SlotDocType;
  label: string;
  status: SlotDocStatus;
}

export interface BookingTimelineStep {
  key: BookingTimelineStepKey;
  label: string;
  status: BookingTimelineStepStatus;
}

export interface SlotBooking {
  id: string;
  slotId: string;
  purchaseRequestId: string;
  warehouse: WarehouseCode;
  warehouseLabel: string;
  bay: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  driver: string;
  material: string;
  quantityMt: number;
  status: SlotStatus;
  shift: SlotShift;
  dispatchDate: string;
  timeSlot: string;
  checklist: SlotChecklist;
  documents: SlotDocument[];
  timeline: BookingTimelineStep[];
  qrCodeData: string;
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlotBookingSummary {
  todaysBookedSlots: number;
  availableVehicles: number;
  upcomingDispatches: number;
  lateArrivals: number;
  avgLoadingTimeMinutes: number;
}

export interface SlotBookingFilters {
  search: string;
  warehouse: string;
  dispatchDate: string;
  shift: string;
  vehicleType: string;
}

export interface ModifySlotFormData {
  dispatchDate: string;
  timeSlot: string;
  warehouse: WarehouseCode | "";
  loadingBay: string;
  vehicleNumber: string;
  driver: string;
}

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  awaiting: "Awaiting Conf.",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  loading: "Loading",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SLOT_SHIFTS: { value: SlotShift | "all"; label: string }[] = [
  { value: "all", label: "All Shifts" },
  { value: "morning", label: "Morning (06:00 - 14:00)" },
  { value: "afternoon", label: "Afternoon (14:00 - 22:00)" },
  { value: "night", label: "Night (22:00 - 06:00)" },
];

export const SLOT_VEHICLE_TYPES = [
  "All Types",
  "Tanker",
  "Trailer",
  "Container",
  "Flatbed",
] as const;

export const SLOT_WAREHOUSES = [
  "All Warehouses",
  "Hazira",
  "Mundra",
  "JNPT",
  "Dahej",
  "Kandla",
] as const;

export const BOOKING_TIMELINE_LABELS: Record<BookingTimelineStepKey, string> = {
  procurement_approved: "Procurement Approved",
  inventory_reserved: "Inventory Reserved",
  vehicle_assigned: "Vehicle Assigned",
  slot_booked: "Slot Booked",
  gate_entry: "Gate Entry",
  loading_started: "Loading Started",
  loading_completed: "Loading Completed",
  shipment_released: "Shipment Released",
};

export const defaultModifySlotForm: ModifySlotFormData = {
  dispatchDate: "",
  timeSlot: "",
  warehouse: "",
  loadingBay: "",
  vehicleNumber: "",
  driver: "",
};
