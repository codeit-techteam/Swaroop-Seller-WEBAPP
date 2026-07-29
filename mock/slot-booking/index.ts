import type {
  BookingTimelineStep,
  BookingTimelineStepKey,
  SlotBooking,
  SlotBookingSummary,
  SlotDocument,
  SlotStatus,
  VehicleType,
  WarehouseCode,
} from "@/types/slot-booking";
import { BOOKING_TIMELINE_LABELS } from "@/types/slot-booking";

const WAREHOUSES: { code: WarehouseCode; label: string }[] = [
  { code: "Hazira", label: "Hazira Terminal" },
  { code: "Mundra", label: "Mundra Port" },
  { code: "JNPT", label: "JNPT Hub" },
  { code: "Dahej", label: "Dahej Complex" },
  { code: "Kandla", label: "Kandla Port" },
];

const MATERIALS = [
  "HDPE Blow Molding",
  "PP Homopolymer",
  "LLDPE Film",
  "Bitumen VG-30",
  "Furnace Oil",
  "PVC Resin",
  "Base Oil SN-150",
  "Lubricants X-1",
];

const VEHICLES = [
  "GJ 06 XX 9901",
  "MH 12 AB 4412",
  "RJ 14 CD 8821",
  "GJ 01 EF 3344",
  "MH 04 GH 5566",
  "TN 09 IJ 7788",
  "KA 03 KL 1122",
  "UP 32 MN 4455",
  "HR 26 OP 6677",
  "GJ 05 QR 2233",
];

const DRIVERS = [
  "Ramesh Patel",
  "Suresh Kumar",
  "Amit Sharma",
  "Vikram Singh",
  "Deepak Mehta",
  "Anil Joshi",
  "Karan Verma",
  "Robert Miller",
];

const VEHICLE_TYPES: VehicleType[] = [
  "Tanker",
  "Trailer",
  "Container",
  "Flatbed",
];

const STATUS_DISTRIBUTION: SlotStatus[] = [
  ...Array(5).fill("awaiting"),
  ...Array(6).fill("confirmed"),
  ...Array(5).fill("checked_in"),
  ...Array(6).fill("loading"),
  ...Array(5).fill("completed"),
  ...Array(3).fill("cancelled"),
] as SlotStatus[];

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function todayIsoDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function daysOffsetIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildDocuments(status: SlotStatus, index: number): SlotDocument[] {
  const insuranceMissing = index % 4 === 0 && status !== "completed";
  return [
    {
      id: `sdoc-rc-${index}`,
      type: "rc_book",
      label: "RC Book",
      status: "uploaded",
    },
    {
      id: `sdoc-dl-${index}`,
      type: "driver_license",
      label: "Driver License",
      status: status === "awaiting" ? "uploaded" : "verified",
    },
    {
      id: `sdoc-ins-${index}`,
      type: "insurance",
      label: "Insurance Policy",
      status: insuranceMissing ? "missing" : "uploaded",
    },
    {
      id: `sdoc-gp-${index}`,
      type: "gate_pass",
      label: "Gate Pass",
      status:
        status === "awaiting" || status === "confirmed"
          ? "missing"
          : "verified",
    },
    {
      id: `sdoc-ls-${index}`,
      type: "loading_slip",
      label: "Loading Slip",
      status:
        status === "loading" || status === "completed" ? "verified" : "missing",
    },
  ];
}

function timelineThrough(
  currentKey: BookingTimelineStepKey,
): BookingTimelineStep[] {
  const keys: BookingTimelineStepKey[] = [
    "procurement_approved",
    "inventory_reserved",
    "vehicle_assigned",
    "slot_booked",
    "gate_entry",
    "loading_started",
    "loading_completed",
    "shipment_released",
  ];
  const currentIndex = keys.indexOf(currentKey);
  return keys.map((key, i) => ({
    key,
    label: BOOKING_TIMELINE_LABELS[key],
    status:
      i < currentIndex
        ? "completed"
        : i === currentIndex
          ? "current"
          : "pending",
  }));
}

function timelineForStatus(status: SlotStatus): BookingTimelineStep[] {
  switch (status) {
    case "awaiting":
      return timelineThrough("vehicle_assigned");
    case "confirmed":
      return timelineThrough("slot_booked");
    case "checked_in":
      return timelineThrough("gate_entry");
    case "loading":
      return timelineThrough("loading_started");
    case "completed":
      return timelineThrough("loading_completed");
    case "cancelled":
      return timelineThrough("slot_booked").map((s) =>
        s.status === "current" ? { ...s, status: "pending" as const } : s,
      );
    default:
      return timelineThrough("slot_booked");
  }
}

function createSlot(index: number): SlotBooking {
  const status = STATUS_DISTRIBUTION[index] ?? "confirmed";
  const warehouse = WAREHOUSES[index % WAREHOUSES.length] ?? WAREHOUSES[0]!;
  const bay = pad((index % 8) + 1);
  const shift =
    index % 3 === 0 ? "morning" : index % 3 === 1 ? "afternoon" : "night";
  const dispatchDate =
    index % 5 === 0
      ? daysOffsetIso(1)
      : index % 7 === 0
        ? daysOffsetIso(-1)
        : todayIsoDate();
  const isLate =
    status === "checked_in" || status === "loading"
      ? index % 11 === 0
      : status === "awaiting" && index % 13 === 0;

  const now = new Date().toISOString();
  const prNum = 8824 + index;
  const slotNum = 202 + index;
  const vehicleNumber = VEHICLES[index % VEHICLES.length] ?? VEHICLES[0]!;
  const vehicleType =
    VEHICLE_TYPES[index % VEHICLE_TYPES.length] ?? VEHICLE_TYPES[0]!;
  const driver = DRIVERS[index % DRIVERS.length] ?? DRIVERS[0]!;
  const material = MATERIALS[index % MATERIALS.length] ?? MATERIALS[0]!;

  return {
    id: `slot-${index + 1}`,
    slotId: `#SL-${slotNum}`,
    purchaseRequestId: `#PR-${prNum}`,
    warehouse: warehouse.code,
    warehouseLabel: `${warehouse.code} - Bay ${bay}`,
    bay,
    vehicleNumber,
    vehicleType,
    driver,
    material,
    quantityMt: Number((12 + (index % 15) * 1.5).toFixed(1)),
    status,
    shift,
    dispatchDate,
    timeSlot:
      shift === "morning"
        ? "08:00 - 10:00"
        : shift === "afternoon"
          ? "14:00 - 16:00"
          : "22:00 - 00:00",
    checklist: {
      securityVerified: status !== "awaiting",
      weighbridgeReady:
        status === "checked_in" ||
        status === "loading" ||
        status === "completed",
      gateEntry:
        status === "checked_in" ||
        status === "loading" ||
        status === "completed",
      loadingApproved: status === "loading" || status === "completed",
    },
    documents: buildDocuments(status, index),
    timeline: timelineForStatus(status),
    qrCodeData: `PETROTRADE|SL-${slotNum}|PR-${prNum}|${warehouse.code}|BAY-${bay}`,
    isLate,
    createdAt: now,
    updatedAt: now,
  };
}

export const slotsMock: SlotBooking[] = Array.from({ length: 30 }, (_, i) =>
  createSlot(i),
);

export function computeSlotSummary(slots: SlotBooking[]): SlotBookingSummary {
  const today = todayIsoDate();
  return {
    todaysBookedSlots: slots.filter(
      (s) => s.dispatchDate === today && s.status !== "cancelled",
    ).length,
    availableVehicles: 12,
    upcomingDispatches: slots.filter(
      (s) =>
        s.status === "confirmed" ||
        s.status === "checked_in" ||
        s.status === "loading",
    ).length,
    lateArrivals: slots.filter((s) => s.isLate).length,
    avgLoadingTimeMinutes: 42,
  };
}

export const slotSummaryMock = computeSlotSummary(slotsMock);
