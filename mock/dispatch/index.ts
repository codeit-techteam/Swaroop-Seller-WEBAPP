import type {
  ChecklistItemKey,
  DispatchActivity,
  DispatchChecklistItem,
  DispatchDocument,
  DispatchOrder,
  DispatchStatus,
  DispatchSummary,
  DriverOption,
  TransportCompanyOption,
  TransportInfo,
  VehicleOption,
  WarehouseCode,
} from "@/types/dispatch";
import { CHECKLIST_LABELS } from "@/types/dispatch";

const WAREHOUSES: { code: WarehouseCode; label: string }[] = [
  { code: "Hazira", label: "Hazira Terminal" },
  { code: "Mundra", label: "Mundra Port" },
  { code: "JNPT", label: "JNPT Hub" },
  { code: "Dahej", label: "Dahej Complex" },
  { code: "Kandla", label: "Kandla Port" },
];

const MATERIALS = [
  "Bitumen VG-30",
  "Furnace Oil",
  "Lubricants X-1",
  "HDPE Blow Molding",
  "PP Homopolymer",
  "LLDPE Film",
  "PVC Resin",
  "Base Oil SN-150",
];

const BUYERS = [
  "Reliance Petrochem Industries",
  "Global Energy Corp",
  "Kirloskar Logistics",
  "Chevron Logistics",
  "Bharat Polymer Hub",
  "Indian Oil Packaging",
  "Aarti Industries Ltd",
  "Gujarat Fluorochem",
  "Supreme Petrochem",
  "Haldia Petro Hub",
];

const DESTINATIONS = [
  "Jamnagar Hub, Gujarat",
  "Navi Mumbai Storage",
  "Pune Industrial Estate",
  "Ahmedabad Depot",
  "Nagpur Terminal",
  "Indore Warehouse",
  "Hyderabad CFS",
  "Chennai Port Yard",
  "Vadodara Plant",
  "Surat Logistics Park",
];

const VEHICLES = [
  "TX-42-BT-9901",
  "GJ-06-XX-9901",
  "MH-12-AB-4412",
  "RJ-14-CD-8821",
  "GJ-01-EF-3344",
  "MH-04-GH-5566",
  "TN-09-IJ-7788",
  "KA-03-KL-1122",
  "UP-32-MN-4455",
  "HR-26-OP-6677",
];

const DRIVERS = [
  "Robert Miller",
  "Ramesh Patel",
  "Suresh Kumar",
  "Amit Sharma",
  "Vikram Singh",
  "Deepak Mehta",
  "Anil Joshi",
  "Karan Verma",
];

const TRANSPORT_COMPANIES = [
  "Chevron Logistics",
  "SafeHaul Transporters",
  "PetroMove Fleet",
  "Western Bulk Carriers",
  "Horizon Tankers",
];

export const vehicleOptionsMock: VehicleOption[] = VEHICLES.map(
  (number, i) => ({
    id: `veh-${i + 1}`,
    number,
    capacityMt: ([28, 32, 36, 40, 42] as const)[i % 5] ?? 40,
    type: (["Tanker", "Trailer", "Container"] as const)[i % 3] ?? "Tanker",
  }),
);

export const driverOptionsMock: DriverOption[] = DRIVERS.map((name, i) => ({
  id: `drv-${i + 1}`,
  name,
  phoneMasked: `+91 ******${String(1000 + i).slice(-4)}`,
}));

export const transportCompanyOptionsMock: TransportCompanyOption[] =
  TRANSPORT_COMPANIES.map((name, i) => ({
    id: `tc-${i + 1}`,
    name,
  }));

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function daysFromNow(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildChecklist(status: DispatchStatus): DispatchChecklistItem[] {
  const order: ChecklistItemKey[] = [
    "paymentVerified",
    "invoiceGenerated",
    "ewayGenerated",
    "vehicleAssigned",
    "loadingStarted",
    "loadingCompleted",
    "dispatchApproved",
  ];

  let completedThrough = 1; // payment + invoice always done for ready
  if (status === "ready_to_dispatch") completedThrough = 1;
  if (status === "vehicle_assigned") completedThrough = 3;
  if (status === "loading_in_progress") completedThrough = 4;
  if (status === "ready_for_release") completedThrough = 5;
  if (
    status === "dispatched" ||
    status === "delivered" ||
    status === "delayed"
  ) {
    completedThrough = 6;
  }

  // E-way may lag behind vehicle assignment for some statuses
  const ewayDone =
    status === "loading_in_progress" ||
    status === "ready_for_release" ||
    status === "dispatched" ||
    status === "delivered" ||
    (status === "vehicle_assigned" && false);

  return order.map((key, index) => {
    let itemStatus: DispatchChecklistItem["status"] = "pending";
    if (key === "ewayGenerated") {
      itemStatus = ewayDone ? "completed" : "pending";
    } else if (index <= completedThrough) {
      itemStatus = "completed";
    } else if (index === completedThrough + 1) {
      itemStatus =
        status === "loading_in_progress" && key === "loadingStarted"
          ? "in_progress"
          : status === "ready_for_release" && key === "dispatchApproved"
            ? "pending"
            : "in_progress";
    }

    if (status === "loading_in_progress" && key === "loadingStarted") {
      itemStatus = "in_progress";
    }

    return {
      key,
      label: CHECKLIST_LABELS[key],
      status: itemStatus,
      completedAt:
        itemStatus === "completed" ? hoursFromNow(-index - 2) : undefined,
    };
  });
}

function buildTransport(
  status: DispatchStatus,
  index: number,
): TransportInfo | null {
  if (status === "ready_to_dispatch") return null;
  const vehicle = VEHICLES[index % VEHICLES.length] ?? VEHICLES[0]!;
  const driver = DRIVERS[index % DRIVERS.length] ?? DRIVERS[0]!;
  const company =
    TRANSPORT_COMPANIES[index % TRANSPORT_COMPANIES.length] ??
    TRANSPORT_COMPANIES[0]!;
  return {
    vehicleNumber: vehicle,
    driver,
    transportCompany: company,
    capacityMt: ([28, 32, 36, 40, 42] as const)[index % 5] ?? 40,
    loadingBay: pad((index % 8) + 1),
    eta: "08:45 AM",
    estimatedDeparture: "11:30 AM",
  };
}

function buildDocuments(
  status: DispatchStatus,
  index: number,
): DispatchDocument[] {
  const ewayAvailable =
    status === "loading_in_progress" ||
    status === "ready_for_release" ||
    status === "dispatched" ||
    status === "delivered";

  return [
    {
      id: `doc-inv-${index}`,
      type: "invoice",
      name: "Invoice.pdf",
      sizeLabel: "1.2 MB",
      available: true,
      mimeType: "application/pdf",
    },
    {
      id: `doc-coa-${index}`,
      type: "coa",
      name: "Quality_Cert.pdf",
      sizeLabel: "850 KB",
      available: true,
      mimeType: "application/pdf",
    },
    {
      id: `doc-eway-${index}`,
      type: "eway_bill",
      name: "E-Way Bill.pdf",
      sizeLabel: "640 KB",
      available: ewayAvailable,
      mimeType: "application/pdf",
    },
    {
      id: `doc-load-${index}`,
      type: "loading_slip",
      name: "Loading_Slip.pdf",
      sizeLabel: "420 KB",
      available: status !== "ready_to_dispatch",
      mimeType: "application/pdf",
    },
    {
      id: `doc-pack-${index}`,
      type: "packing_list",
      name: "Packing_List.pdf",
      sizeLabel: "510 KB",
      available: true,
      mimeType: "application/pdf",
    },
  ];
}

function buildActivity(
  status: DispatchStatus,
  index: number,
): DispatchActivity[] {
  const items: DispatchActivity[] = [
    {
      id: `act-pay-${index}`,
      type: "note",
      title: "Payment verified by Finance",
      timestamp: hoursFromNow(-30),
      status: "success",
    },
    {
      id: `act-inv-${index}`,
      type: "note",
      title: "Tax invoice generated",
      timestamp: hoursFromNow(-28),
      status: "success",
    },
  ];

  if (status !== "ready_to_dispatch") {
    items.unshift({
      id: `act-veh-${index}`,
      type: "vehicle_assigned",
      title: `Vehicle ${VEHICLES[index % VEHICLES.length]} assigned`,
      description: `Driver ${DRIVERS[index % DRIVERS.length]} confirmed`,
      timestamp: hoursFromNow(-12),
      status: "success",
    });
  }

  if (
    status === "loading_in_progress" ||
    status === "ready_for_release" ||
    status === "dispatched" ||
    status === "delivered" ||
    status === "delayed"
  ) {
    items.unshift({
      id: `act-gate-${index}`,
      type: "gate_entry",
      title: `Vehicle ${VEHICLES[index % VEHICLES.length]} checked in`,
      timestamp: hoursFromNow(-6),
      status: "info",
    });
    items.unshift({
      id: `act-load-${index}`,
      type: "loading_started",
      title: `Loading gate ${pad((index % 8) + 1)} assigned by Admin`,
      timestamp: hoursFromNow(-2),
      status: "success",
    });
  }

  if (
    status === "ready_for_release" ||
    status === "dispatched" ||
    status === "delivered" ||
    status === "delayed"
  ) {
    items.unshift({
      id: `act-done-${index}`,
      type: "loading_completed",
      title: "Loading completed — ready for release",
      timestamp: hoursFromNow(-1),
      status: "success",
    });
  }

  if (
    status === "dispatched" ||
    status === "delivered" ||
    status === "delayed"
  ) {
    items.unshift({
      id: `act-rel-${index}`,
      type: "shipment_released",
      title: "Shipment released from terminal",
      timestamp: hoursFromNow(-0.5),
      status: "success",
    });
  }

  return items;
}

const STATUS_DISTRIBUTION: DispatchStatus[] = [
  ...Array(10).fill("ready_to_dispatch"),
  ...Array(8).fill("vehicle_assigned"),
  ...Array(6).fill("loading_in_progress"),
  ...Array(4).fill("ready_for_release"),
  ...Array(6).fill("dispatched"),
  ...Array(4).fill("delivered"),
  ...Array(2).fill("delayed"),
] as DispatchStatus[];

function createDispatch(index: number): DispatchOrder {
  const status = STATUS_DISTRIBUTION[index] ?? "ready_to_dispatch";
  const warehouse = WAREHOUSES[index % WAREHOUSES.length] ?? WAREHOUSES[0]!;
  const material = MATERIALS[index % MATERIALS.length] ?? MATERIALS[0]!;
  const buyer = BUYERS[index % BUYERS.length] ?? BUYERS[0]!;
  const destination =
    DESTINATIONS[index % DESTINATIONS.length] ?? DESTINATIONS[0]!;
  const orderNum = 94821 + index;
  const dispatchNum = 44102 + index;
  const isDelayed =
    status === "delayed" || (status === "ready_to_dispatch" && index % 7 === 0);
  const hoursUntil = isDelayed || index % 5 === 0 ? 4 + (index % 3) : null;
  const deadline =
    hoursUntil !== null
      ? hoursFromNow(hoursUntil)
      : daysFromNow(1 + (index % 4), 10 + (index % 8));
  const deadlineLabel =
    hoursUntil !== null ? `${hoursUntil}h ${12 + (index % 40)}m` : undefined;

  const now = new Date().toISOString();

  return {
    id: `dsp-${index + 1}`,
    dispatchId: `DSP-${dispatchNum}`,
    orderId: `ord-${orderNum}`,
    orderNumber: `#ORD-${orderNum}`,
    buyerCompany: buyer,
    material,
    materialGrade: material,
    quantityMt: Number((5 + (index % 20) * 1.5 + (index % 3) * 0.5).toFixed(1)),
    destination,
    warehouse: warehouse.code,
    warehouseLabel: warehouse.label,
    deadline,
    deadlineLabel,
    status: isDelayed && status !== "delayed" ? status : status,
    isDelayed,
    checklist: buildChecklist(isDelayed ? "delayed" : status),
    transport: buildTransport(
      status === "delayed" ? "dispatched" : status,
      index,
    ),
    documents: buildDocuments(
      status === "delayed" ? "dispatched" : status,
      index,
    ),
    activity: buildActivity(
      status === "delayed" ? "dispatched" : status,
      index,
    ),
    invoiceNumber: `INV-2026-${pad(1200 + index, 4)}`,
    gstNumber: `24AABCR${pad(1000 + index, 4)}A1Z${index % 10}`,
    ewayBillNumber:
      status === "loading_in_progress" ||
      status === "ready_for_release" ||
      status === "dispatched" ||
      status === "delivered" ||
      status === "delayed"
        ? `EWB${pad(880000 + index, 6)}`
        : undefined,
    createdAt: hoursFromNow(-48 - index),
    updatedAt: now,
    dispatchedAt:
      status === "dispatched" || status === "delivered" || status === "delayed"
        ? hoursFromNow(-4)
        : undefined,
    deliveredAt: status === "delivered" ? hoursFromNow(-1) : undefined,
  };
}

export const dispatchesMock: DispatchOrder[] = Array.from(
  { length: 40 },
  (_, i) => createDispatch(i),
);

export function computeDispatchSummary(
  orders: DispatchOrder[],
): DispatchSummary {
  const today = new Date();
  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  return {
    readyForDispatch: orders.filter((o) => o.status === "ready_to_dispatch")
      .length,
    vehiclePending: orders.filter((o) => o.status === "vehicle_assigned")
      .length,
    loading: orders.filter((o) => o.status === "loading_in_progress").length,
    dispatchedToday: orders.filter(
      (o) =>
        (o.status === "dispatched" || o.status === "delivered") &&
        isToday(o.dispatchedAt),
    ).length,
    deliveredToday: orders.filter(
      (o) => o.status === "delivered" && isToday(o.deliveredAt),
    ).length,
    delayed: orders.filter((o) => o.isDelayed || o.status === "delayed").length,
  };
}

export const dispatchSummaryMock = computeDispatchSummary(dispatchesMock);
