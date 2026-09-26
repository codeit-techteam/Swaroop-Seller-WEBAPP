import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import type {
  BookVehicleSlotPayload,
  EligibleDispatch,
  LoadingBayOption,
  LogisticsDriver,
  LogisticsVehicle,
  LogisticsWarehouse,
  SellerVehicleSlot,
  VehicleSlotAvailability,
  VehicleSlotListParams,
  VehicleSlotPage,
  VehicleSlotSummary,
} from "@/types/vehicle-slots";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
  code?: string;
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function getData<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ data: T; meta?: Envelope<T>["meta"] }> {
  const response = await apiClient.get<Envelope<T>>(url, { params });
  return { data: response.data.data as T, meta: response.data.meta };
}

function dateOnly(value: unknown): string {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function mapSlot(row: Record<string, unknown>): SellerVehicleSlot {
  const buyer = row.buyer as {
    displayName?: string;
    reference?: string;
  } | null;
  return {
    id: String(row.id),
    slotNumber: row.slotNumber != null ? String(row.slotNumber) : null,
    warehouseId: String(row.warehouseId ?? ""),
    warehouseName: row.warehouseName != null ? String(row.warehouseName) : null,
    warehouseCode: row.warehouseCode != null ? String(row.warehouseCode) : null,
    warehouseCity: row.warehouseCity != null ? String(row.warehouseCity) : null,
    dispatchId: row.dispatchId != null ? String(row.dispatchId) : null,
    dispatchNumber:
      row.dispatchNumber != null ? String(row.dispatchNumber) : null,
    orderId: row.orderId != null ? String(row.orderId) : null,
    purchaseOrderReference:
      row.purchaseOrderReference != null
        ? String(row.purchaseOrderReference)
        : null,
    vehicleId: row.vehicleId != null ? String(row.vehicleId) : null,
    vehicleNumber: row.vehicleNumber != null ? String(row.vehicleNumber) : null,
    vehicleType: row.vehicleType != null ? String(row.vehicleType) : null,
    carrier: row.carrier != null ? String(row.carrier) : null,
    driverId: row.driverId != null ? String(row.driverId) : null,
    driverName: row.driverName != null ? String(row.driverName) : null,
    driverPhone: row.driverPhone != null ? String(row.driverPhone) : null,
    shipmentId: row.shipmentId != null ? String(row.shipmentId) : null,
    shipmentNumber:
      row.shipmentNumber != null ? String(row.shipmentNumber) : null,
    slotDate: dateOnly(row.slotDate),
    startTime: row.startTime != null ? String(row.startTime) : null,
    endTime: row.endTime != null ? String(row.endTime) : null,
    timeSlot: row.timeSlot != null ? String(row.timeSlot) : null,
    loadingBay: row.loadingBay != null ? String(row.loadingBay) : null,
    status: String(row.status ?? "REQUESTED") as SellerVehicleSlot["status"],
    quantityMt: row.quantityMt as string | number | null,
    unit: String(row.unit ?? "MT"),
    destinationRegion:
      row.destinationRegion != null ? String(row.destinationRegion) : null,
    buyer: buyer
      ? {
          displayName: buyer.displayName ?? "Anonymous Buyer",
          reference: buyer.reference ?? null,
        }
      : { displayName: "Anonymous Buyer" },
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
  };
}

export function vehicleSlotApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
          code?: string;
          error?: { message?: string; code?: string };
        }
      | undefined;
    const code = data?.code ?? data?.error?.code;
    const message = data?.message ?? data?.error?.message;

    if (code === "VEHICLE_SLOT_UNAVAILABLE") {
      return typeof message === "string" && message
        ? message
        : "This slot is no longer available. Please select another slot.";
    }
    if (code === "PAYMENT_NOT_CLEARED") {
      return "Vehicle slot booking is not available until the required payment condition is cleared.";
    }
    if (code === "DISPATCH_QUANTITY_EXCEEDED") {
      return "Requested quantity exceeds the remaining dispatch quantity.";
    }
    if (
      code === "VEHICLE_DOCUMENT_EXPIRED" ||
      code === "VEHICLE_NOT_COMPLIANT"
    ) {
      return typeof message === "string" && message
        ? message
        : "Vehicle compliance documents are invalid or expired.";
    }
    if (code === "DRIVER_LICENSE_EXPIRED") {
      return "Driver license is expired.";
    }
    if (code === "VEHICLE_CAPACITY_INSUFFICIENT") {
      return "Selected vehicle capacity is insufficient for this quantity.";
    }

    if (error.response?.status === 401) {
      return "Session expired. Please sign in again.";
    }
    if (error.response?.status === 403) {
      return "You do not have permission to manage this vehicle slot.";
    }
    if (error.response?.status === 404) {
      return "Requested order, vehicle, or slot was not found.";
    }
    if (error.response?.status === 409) {
      return typeof message === "string" && message
        ? message
        : "This slot is no longer available. Please select another slot.";
    }
    if (error.response?.status === 422 || error.response?.status === 400) {
      if (typeof message === "string" && message) return message;
      if (Array.isArray(message) && message[0]) return String(message[0]);
      return "Please check the booking details and try again.";
    }
    if (!error.response) {
      return "Unable to reach PetroTrade API. Confirm the backend is running.";
    }
    if (
      typeof message === "string" &&
      message &&
      !message.includes("status code")
    ) {
      return message;
    }
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (error.response.status >= 500) {
      return "Something went wrong. Please try again.";
    }
  }
  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("status code")
  ) {
    return error.message;
  }
  return fallback;
}

export async function fetchVehicleSlotSummary(
  date?: string,
): Promise<VehicleSlotSummary> {
  const { data } = await getData<VehicleSlotSummary>(
    "/seller/vehicle-slots/summary",
    {
      ...(date ? { date } : {}),
    },
  );
  return {
    date: dateOnly(data.date) || date || "",
    today: {
      total: num(data.today?.total),
      booked: num(data.today?.booked),
      available: num(data.today?.available),
      completed: num(data.today?.completed),
      cancelled: num(data.today?.cancelled),
    },
  };
}

export async function fetchVehicleSlotsPage(
  params: VehicleSlotListParams = {},
): Promise<VehicleSlotPage> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sortBy: params.sortBy ?? "slotDate",
    sortOrder: params.sortOrder ?? "desc",
  };
  if (params.status && params.status !== "all") query.status = params.status;
  if (params.warehouseId && params.warehouseId !== "all") {
    query.warehouseId = params.warehouseId;
  }
  if (params.date) query.date = params.date;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  if (params.vehicleType && params.vehicleType !== "all") {
    query.vehicleType = params.vehicleType;
  }
  if (params.carrier && params.carrier !== "all")
    query.carrier = params.carrier;
  if (params.orderId) query.orderId = params.orderId;
  if (params.dispatchId) query.dispatchId = params.dispatchId;
  if (params.search?.trim()) query.search = params.search.trim();

  const { data, meta } = await getData<Array<Record<string, unknown>>>(
    "/seller/vehicle-slots",
    query,
  );
  const page = num(meta?.page, params.page ?? 1);
  const limit = num(meta?.limit, params.limit ?? 20);
  const total = num(meta?.total, Array.isArray(data) ? data.length : 0);
  return {
    items: (Array.isArray(data) ? data : []).map(mapSlot),
    pagination: {
      page,
      limit,
      total,
      totalPages: num(meta?.totalPages, Math.max(1, Math.ceil(total / limit))),
    },
  };
}

export async function fetchVehicleSlotById(
  id: string,
): Promise<SellerVehicleSlot> {
  const { data } = await getData<Record<string, unknown>>(
    `/seller/vehicle-slots/${id}`,
  );
  return mapSlot(data);
}

export async function fetchVehicleSlotAvailability(params: {
  warehouseId: string;
  date: string;
  loadingBayId?: string;
  vehicleId?: string;
  vehicleType?: string;
}): Promise<VehicleSlotAvailability> {
  const { data } = await getData<VehicleSlotAvailability>(
    "/seller/vehicle-slots/availability",
    params,
  );
  return data;
}

export async function fetchLogisticsWarehouses(): Promise<
  LogisticsWarehouse[]
> {
  const { data } = await getData<LogisticsWarehouse[]>(
    "/seller/logistics/warehouses",
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchLoadingBays(
  warehouseId: string,
): Promise<LoadingBayOption[]> {
  const { data } = await getData<LoadingBayOption[]>(
    "/seller/logistics/loading-bays",
    { warehouseId },
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchEligibleDispatches(
  search?: string,
): Promise<EligibleDispatch[]> {
  const { data } = await getData<EligibleDispatch[]>(
    "/seller/vehicle-slots/eligible-dispatches",
    search?.trim() ? { search: search.trim() } : undefined,
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchLogisticsVehicles(params?: {
  vehicleType?: string;
  vehicleStatus?: string;
  search?: string;
  limit?: number;
}): Promise<LogisticsVehicle[]> {
  const { data } = await getData<Array<Record<string, unknown>>>(
    "/seller/vehicles",
    {
      page: 1,
      limit: params?.limit ?? 100,
      ...(params?.vehicleType ? { vehicleType: params.vehicleType } : {}),
      ...(params?.vehicleStatus
        ? { vehicleStatus: params.vehicleStatus }
        : { vehicleStatus: "AVAILABLE" }),
      ...(params?.search ? { search: params.search } : {}),
    },
  );
  return (Array.isArray(data) ? data : []).map((row) => ({
    id: String(row.id),
    type: String(row.type ?? "TRUCK"),
    numberPlate: String(row.numberPlate ?? ""),
    transporterName:
      row.transporterName != null ? String(row.transporterName) : null,
    driverId: row.driverId != null ? String(row.driverId) : null,
    driverName: row.driverName != null ? String(row.driverName) : null,
    driverPhone: row.driverPhone != null ? String(row.driverPhone) : null,
    capacityMt: row.capacityMt != null ? String(row.capacityMt) : null,
    status: String(row.status ?? "AVAILABLE"),
    insuranceExpiry:
      row.insuranceExpiry != null ? String(row.insuranceExpiry) : null,
    fitnessExpiry: row.fitnessExpiry != null ? String(row.fitnessExpiry) : null,
    permitExpiry: row.permitExpiry != null ? String(row.permitExpiry) : null,
    pollutionExpiry:
      row.pollutionExpiry != null ? String(row.pollutionExpiry) : null,
    isActive: Boolean(row.isActive ?? true),
  }));
}

export async function fetchLogisticsDrivers(params?: {
  search?: string;
  limit?: number;
}): Promise<LogisticsDriver[]> {
  const { data } = await getData<Array<Record<string, unknown>>>(
    "/seller/drivers",
    {
      page: 1,
      limit: params?.limit ?? 100,
      ...(params?.search ? { search: params.search } : {}),
    },
  );
  return (Array.isArray(data) ? data : [])
    .map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      phone: row.phone != null ? String(row.phone) : null,
      licenseNumber:
        row.licenseNumber != null ? String(row.licenseNumber) : null,
      licenseExpiry:
        row.licenseExpiry != null ? String(row.licenseExpiry) : null,
      status: String(row.status ?? "AVAILABLE"),
    }))
    .filter((d) => d.status !== "INACTIVE");
}

export async function bookVehicleSlot(
  payload: BookVehicleSlotPayload,
): Promise<SellerVehicleSlot> {
  const response = await apiClient.post<Envelope<Record<string, unknown>>>(
    "/seller/vehicle-slots",
    payload,
  );
  return mapSlot(response.data.data);
}

export async function cancelVehicleSlot(
  id: string,
): Promise<SellerVehicleSlot> {
  const response = await apiClient.post<Envelope<Record<string, unknown>>>(
    `/seller/vehicle-slots/${id}/cancel`,
  );
  return mapSlot(response.data.data);
}

export async function exportVehicleSlots(
  params: VehicleSlotListParams = {},
): Promise<SellerVehicleSlot[]> {
  const query: Record<string, unknown> = {};
  if (params.status && params.status !== "all") query.status = params.status;
  if (params.warehouseId && params.warehouseId !== "all") {
    query.warehouseId = params.warehouseId;
  }
  if (params.date) query.date = params.date;
  if (params.vehicleType && params.vehicleType !== "all") {
    query.vehicleType = params.vehicleType;
  }
  if (params.carrier && params.carrier !== "all")
    query.carrier = params.carrier;
  if (params.orderId) query.orderId = params.orderId;
  if (params.search?.trim()) query.search = params.search.trim();

  const { data } = await getData<Array<Record<string, unknown>>>(
    "/seller/vehicle-slots/export",
    query,
  );
  return (Array.isArray(data) ? data : []).map(mapSlot);
}
