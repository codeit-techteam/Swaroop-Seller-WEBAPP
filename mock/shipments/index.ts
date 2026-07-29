import type {
  Shipment,
  ShipmentDocument,
  ShipmentStatus,
  ShipmentSummary,
  ShipmentTimelineStep,
  TimelineStepKey,
  VehicleDriverInfo,
  WarehouseCode,
} from "@/types/shipments";
import { TIMELINE_STEP_LABELS } from "@/types/shipments";

const WAREHOUSES: { code: WarehouseCode; label: string }[] = [
  { code: "Hazira", label: "Hazira Plant, Gujarat" },
  { code: "Dahej", label: "Dahej Complex, Gujarat" },
  { code: "JNPT", label: "JNPT Hub, Maharashtra" },
  { code: "Mundra", label: "Mundra Port, Gujarat" },
  { code: "Kandla", label: "Kandla Port, Gujarat" },
];

const PRODUCTS = [
  "Polypropylene (PP)",
  "HDPE Blow Molding",
  "LLDPE Film Grade",
  "PVC Resin K-67",
  "Bitumen VG-30",
  "Furnace Oil",
  "Base Oil SN-150",
  "Lubricants X-1",
  "PP Homopolymer",
  "Ethylene Glycol",
];

const BUYERS = [
  "Reliance Poly Industries",
  "Global Energy Corp",
  "Kirloskar Logistics",
  "Chevron Logistics",
  "Bharat Polymer Hub",
  "Indian Oil Packaging",
  "Aarti Industries Ltd",
  "Gujarat Fluorochem",
  "Supreme Petrochem",
  "Haldia Petro Hub",
  "Adani Polymers",
  "Tata Chemicals",
  "UPL Limited",
  "Deepak Nitrite",
  "Navin Fluorine",
];

const DESTINATIONS = [
  "Patalganga Warehouse, MH",
  "Navi Mumbai Storage, MH",
  "Pune Industrial Estate, MH",
  "Ahmedabad Depot, GJ",
  "Nagpur Terminal, MH",
  "Indore Warehouse, MP",
  "Hyderabad CFS, TS",
  "Chennai Port Yard, TN",
  "Vadodara Plant, GJ",
  "Surat Logistics Park, GJ",
  "Jaipur Distribution Hub, RJ",
  "Lucknow Terminal, UP",
];

const VEHICLES = [
  "GJ-06-AZ-1102",
  "MH-12-AB-4412",
  "GJ-01-EF-3344",
  "RJ-14-CD-8821",
  "TN-09-IJ-7788",
  "KA-03-KL-1122",
  "UP-32-MN-4455",
  "HR-26-OP-6677",
  "GJ-05-PQ-2233",
  "MH-04-GH-5566",
];

const DRIVERS = [
  "Ramesh Kumar",
  "Suresh Patel",
  "Amit Sharma",
  "Vikram Singh",
  "Deepak Mehta",
  "Anil Joshi",
  "Karan Verma",
  "Rajesh Nair",
  "Sunil Desai",
  "Manoj Tiwari",
];

const TRANSPORTERS = [
  "BlueDart Freight",
  "SafeHaul Transporters",
  "PetroMove Fleet",
  "Western Bulk Carriers",
  "Horizon Tankers",
  "Chevron Logistics",
];

const STATUSES: ShipmentStatus[] = [
  "ready_for_dispatch",
  "in_transit",
  "dispatched",
  "delayed",
  "delivered",
  "pending",
];

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildTimeline(
  status: ShipmentStatus,
  dispatchDate: string,
  expectedDelivery: string,
): ShipmentTimelineStep[] {
  const steps: TimelineStepKey[] = [
    "order_accepted",
    "payment_verified",
    "invoice_generated",
    "vehicle_assigned",
    "loading_started",
    "loading_completed",
    "shipment_dispatched",
    "reached_destination",
    "delivered",
  ];

  let completedThrough = 0;
  let currentIndex = 0;

  switch (status) {
    case "pending":
      completedThrough = 0;
      currentIndex = 0;
      break;
    case "ready_for_dispatch":
      completedThrough = 5;
      currentIndex = 5;
      break;
    case "dispatched":
      completedThrough = 6;
      currentIndex = 6;
      break;
    case "in_transit":
      completedThrough = 6;
      currentIndex = 6;
      break;
    case "delayed":
      completedThrough = 6;
      currentIndex = 6;
      break;
    case "delivered":
      completedThrough = 8;
      currentIndex = 8;
      break;
  }

  return steps.map((key, index) => {
    let stepStatus: ShipmentTimelineStep["status"] = "pending";
    if (index < completedThrough) stepStatus = "completed";
    else if (index === currentIndex && status !== "delivered")
      stepStatus = "current";
    else if (index === currentIndex && status === "delivered")
      stepStatus = "completed";

    let timestamp: string | undefined;
    if (stepStatus === "completed" || stepStatus === "current") {
      if (key === "delivered") timestamp = expectedDelivery;
      else if (key === "shipment_dispatched") timestamp = dispatchDate;
      else timestamp = daysAgo(10 - index, 9 + index);
    }

    let description: string | undefined;
    if (key === "delivered" && status !== "delivered") {
      description = `Estimated: ${new Date(expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
    }

    return {
      key,
      label: TIMELINE_STEP_LABELS[key],
      status: stepStatus,
      timestamp,
      description,
    };
  });
}

function buildDocuments(
  status: ShipmentStatus,
  shipmentId: string,
): ShipmentDocument[] {
  const hasInvoice = status !== "pending";
  const hasEway =
    status === "in_transit" ||
    status === "dispatched" ||
    status === "delayed" ||
    status === "delivered";
  const hasLoading = status !== "pending" && status !== "ready_for_dispatch";
  const hasPacking = status !== "pending" && status !== "ready_for_dispatch";
  const hasPod = status === "delivered";

  return [
    {
      id: `${shipmentId}-inv`,
      type: "invoice",
      name: "Invoice",
      sizeLabel: "245 KB",
      status: hasInvoice ? "available" : "pending",
      mimeType: "application/pdf",
    },
    {
      id: `${shipmentId}-eway`,
      type: "eway_bill",
      name: "E-Way Bill",
      sizeLabel: "180 KB",
      status: hasEway ? "available" : "pending",
      mimeType: "application/pdf",
    },
    {
      id: `${shipmentId}-loading`,
      type: "loading_slip",
      name: "Loading Slip",
      sizeLabel: "120 KB",
      status: hasLoading ? "available" : "pending",
      mimeType: "application/pdf",
    },
    {
      id: `${shipmentId}-packing`,
      type: "packing_list",
      name: "Packing List",
      sizeLabel: "95 KB",
      status: hasPacking ? "available" : "pending",
      mimeType: "application/pdf",
    },
    {
      id: `${shipmentId}-pod`,
      type: "pod",
      name: "POD",
      sizeLabel: hasPod ? "320 KB" : "—",
      status: hasPod ? "uploaded" : "missing",
      mimeType: hasPod ? "application/pdf" : "application/pdf",
    },
  ];
}

function buildVehicleInfo(
  index: number,
  status: ShipmentStatus,
  destination: string,
): VehicleDriverInfo | null {
  if (status === "pending" || status === "ready_for_dispatch") return null;

  const driver = DRIVERS[index % DRIVERS.length]!;
  const locations = [
    "NH-48, Surat Bypass",
    "Mumbai-Pune Expressway",
    "Ahmedabad Ring Road",
    "NH-27, Rajkot",
    "Vadodara Industrial Area",
  ];

  return {
    truckNumber: VEHICLES[index % VEHICLES.length]!,
    driverName: driver,
    driverPhone: `+91 98765-${String(43210 + index).slice(-5)}`,
    transportCompany: TRANSPORTERS[index % TRANSPORTERS.length]!,
    driverAvatarInitials: getInitials(driver),
    capacityMt: ([28, 32, 36, 40, 42] as const)[index % 5] ?? 40,
    currentLocation:
      status === "delivered"
        ? destination
        : locations[index % locations.length]!,
  };
}

function generateShipments(): Shipment[] {
  const shipments: Shipment[] = [];

  for (let i = 0; i < 60; i++) {
    const status = STATUSES[i % STATUSES.length]!;
    const warehouse = WAREHOUSES[i % WAREHOUSES.length]!;
    const destination = DESTINATIONS[i % DESTINATIONS.length]!;
    const dispatchDate = daysAgo(Math.floor(i / 3), 11);
    const expectedDelivery =
      status === "delivered"
        ? daysAgo(Math.floor(i / 5), 16)
        : daysFromNow(2 + (i % 7), 18);
    const shipmentNum = 9942 - i;
    const orderNum = 44102 - i;
    const shipmentId = `SHP-${shipmentNum}`;
    const id = `shp-${i + 1}`;

    const isDelayed = status === "delayed";

    shipments.push({
      id,
      shipmentId,
      orderId: `ORD-${orderNum}`,
      buyerCompany: BUYERS[i % BUYERS.length]!,
      product: PRODUCTS[i % PRODUCTS.length]!,
      quantityMt: Math.round((18 + (i % 15) + (i % 3) * 0.5) * 10) / 10,
      sourceWarehouse: warehouse.code,
      sourceWarehouseLabel: warehouse.label,
      destinationWarehouse: destination,
      distanceKm: 200 + (i % 8) * 85,
      eta: expectedDelivery,
      vehicle: VEHICLES[i % VEHICLES.length]!,
      transporter: TRANSPORTERS[i % TRANSPORTERS.length]!,
      dispatchDate,
      expectedDelivery,
      status,
      isDelayed,
      invoiceNumber:
        status !== "pending" ? `INV-2026-${pad(1000 + i)}` : undefined,
      gstNumber: "24AABCR1234F1Z5",
      ewayBillNumber:
        status === "in_transit" ||
        status === "dispatched" ||
        status === "delayed" ||
        status === "delivered"
          ? `EWB-${2026000 + i}`
          : undefined,
      timeline: buildTimeline(status, dispatchDate, expectedDelivery),
      documents: buildDocuments(status, id),
      vehicleInfo: buildVehicleInfo(i, status, destination),
      deliveredAt: status === "delivered" ? expectedDelivery : undefined,
      createdAt: daysAgo(14 + (i % 5)),
      updatedAt: daysAgo(i % 3),
    });
  }

  return shipments;
}

export const shipmentsMock: Shipment[] = generateShipments();

export function computeShipmentSummary(shipments: Shipment[]): ShipmentSummary {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    readyToDispatch: shipments.filter((s) => s.status === "ready_for_dispatch")
      .length,
    inTransit: shipments.filter(
      (s) => s.status === "in_transit" || s.status === "dispatched",
    ).length,
    deliveredThisMonth: shipments.filter(
      (s) =>
        s.status === "delivered" &&
        s.deliveredAt &&
        new Date(s.deliveredAt) >= monthStart,
    ).length,
    delayed: shipments.filter((s) => s.status === "delayed" || s.isDelayed)
      .length,
  };
}

export const shipmentTransporters = TRANSPORTERS;
export const shipmentLocations = WAREHOUSES.map((w) => w.code);
