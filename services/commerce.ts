import { sellerPaymentMethodLabel } from "@/lib/seller/payment";
import { apiClient } from "@/services/apiClient";
import { fetchSellerDispatchesPage } from "@/services/seller-dispatches";
import type {
  FetchSellerOrdersParams,
  OfferStatus,
  PurchaseRequestStatus,
  SellerDispatch,
  SellerOffer,
  SellerOfferSummary,
  SellerOrder,
  SellerOrdersPage,
  SellerOrderStatus,
  SellerOrderSummary,
  SellerOrderTimelineEvent,
  SellerPayment,
  SellerPurchaseRequest,
  SellerSettlement,
  SellerShipment,
  SettlementStatus,
} from "@/types/seller";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function iso(value: unknown) {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

async function getData<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.get<Envelope<T>>(url, { params });
  return response.data.data as T;
}

function mapOfferStatus(status?: string): OfferStatus {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "paused";
  if (status === "EXPIRED") return "expired";
  return "draft";
}

function mapPrStatus(status?: string): PurchaseRequestStatus {
  switch (status) {
    case "APPROVED":
    case "CONVERTED_TO_ORDER":
      return "accepted";
    case "REJECTED":
    case "CANCELLED":
    case "WITHDRAWN":
      return "rejected";
    case "EXPIRED":
      return "expired";
    case "NEGOTIATION":
    case "OFFER_RECEIVED":
      return "counter_sent";
    case "UNDER_REVIEW":
    case "SOURCING":
    case "PENDING_APPROVAL":
      return "under_review";
    default:
      return "new";
  }
}

function mapOrderStatus(status?: string): SellerOrderStatus {
  const key = (status ?? "").toUpperCase().replaceAll("-", "_");
  if (key === "CANCELLED" || key.includes("CANCEL") || key === "REJECTED") {
    return "cancelled";
  }
  if (key === "DELIVERED" || key === "COMPLETED" || key.includes("DELIVER")) {
    return "delivered";
  }
  if (key === "DISPATCHED" || key === "IN_TRANSIT" || key.includes("TRANSIT")) {
    return "in_transit";
  }
  if (key === "READY_FOR_DISPATCH" || key.includes("READY")) {
    return "ready_for_dispatch";
  }
  if (key === "PROCESSING" || key.includes("PROCESS")) {
    return "processing";
  }
  return "confirmed";
}

function toSellerApiStatus(status?: string): string | undefined {
  if (!status || status === "all") return undefined;
  if (status === "in_transit") return "DISPATCHED";
  return status.toUpperCase();
}

type BackendOffer = {
  id: string;
  referenceNumber?: string;
  productId?: string;
  warehouseId?: string | null;
  version?: number;
  product?: { id?: string; name?: string };
  grade?: { code?: string; name?: string; displayName?: string | null };
  warehouse?: {
    id?: string;
    name?: string;
    city?: string | null;
    state?: string | null;
  } | null;
  priceTiers?: Array<{
    id?: string;
    minQty?: unknown;
    maxQty?: unknown;
    price?: unknown;
  }>;
  basePrice?: unknown;
  quantity?: unknown;
  moq?: unknown;
  unit?: string;
  validUntil?: string | null;
  paymentTerms?: unknown;
  deliveryTerms?: string | null;
  status?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { purchaseRequestItems?: number };
};

export function mapSellerOffer(
  item: BackendOffer,
  locationId?: string,
): SellerOffer {
  const warehouseId =
    item.warehouseId ?? item.warehouse?.id ?? locationId ?? "";
  const validUntil = item.validUntil
    ? iso(item.validUntil)
    : iso(Date.now() + 86400000);
  const hours = Math.max(
    1,
    Math.round(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60),
    ),
  );
  const metadata = item.metadata ?? {};
  const remarks = typeof metadata.remarks === "string" ? metadata.remarks : "";
  const gstPercent =
    typeof metadata.gstPercent === "number"
      ? metadata.gstPercent
      : Number(metadata.gstPercent) || 18;

  return {
    id: item.id,
    sellerId: "self",
    locationId: warehouseId,
    productId: item.productId ?? item.product?.id ?? item.id,
    referenceNumber: item.referenceNumber,
    category: item.grade?.name ?? "Grade",
    gradeName:
      item.product?.name ??
      item.grade?.displayName ??
      item.grade?.name ??
      "Offer",
    manufacturer: "PRIVATE",
    price: num(item.basePrice),
    unit: item.unit ?? "MT",
    availableQty: num(item.quantity),
    moq: num(item.moq),
    validityHours: hours,
    validUntil,
    paymentTerms: sellerPaymentMethodLabel(
      typeof item.paymentTerms === "string"
        ? item.paymentTerms
        : typeof item.paymentTerms === "object" &&
            item.paymentTerms &&
            "method" in (item.paymentTerms as Record<string, unknown>)
          ? String(
              (item.paymentTerms as { method?: unknown }).method ?? "ADVANCE",
            )
          : JSON.stringify(item.paymentTerms ?? "ADVANCE"),
    ),
    deliveryLocation:
      item.deliveryTerms ??
      item.warehouse?.city ??
      item.warehouse?.name ??
      "Assigned hub",
    remarks,
    gstPercent,
    bulkPricing: (item.priceTiers ?? []).map((tier, index) => ({
      id: tier.id ?? `tier-${index}`,
      minQty: num(tier.minQty),
      maxQty: tier.maxQty == null ? null : num(tier.maxQty),
      price: num(tier.price),
    })),
    status: mapOfferStatus(item.status),
    version: item.version,
    purchaseRequestCount: item._count?.purchaseRequestItems ?? 0,
    warehouseName: item.warehouse?.name,
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt ?? item.createdAt),
  };
}

type BackendPr = {
  id: string;
  referenceNumber: string;
  status: string;
  paymentMethod?: string | null;
  targetPrice?: unknown;
  destinationRegion?: string | null;
  notes?: string | null;
  createdAt?: string;
  responseDeadline?: string | null;
  remainingSeconds?: number | null;
  allowedActions?: string[];
  buyer?: { displayName?: string; reference?: string };
  items?: Array<{
    product?: { id?: string; name?: string } | null;
    grade?: {
      name?: string;
      code?: string;
      displayName?: string | null;
    } | null;
    quantity?: unknown;
    targetUnitPrice?: unknown;
  }>;
};

export function mapSellerPr(
  item: BackendPr,
  locationId: string,
): SellerPurchaseRequest {
  const line = item.items?.[0];
  return {
    id: item.id,
    requestNumber: item.referenceNumber,
    productId: line?.product?.id ?? item.id,
    category: line?.grade?.name ?? "Grade",
    gradeName:
      line?.product?.name ??
      line?.grade?.displayName ??
      line?.grade?.name ??
      "Purchase request",
    quantityMt: num(line?.quantity),
    requestedPrice: num(line?.targetUnitPrice ?? item.targetPrice),
    deliveryLocation: item.destinationRegion ?? "Assigned destination",
    requestedDeliveryDate: iso(item.createdAt).slice(0, 10),
    paymentTerms: sellerPaymentMethodLabel(item.paymentMethod),
    notes: item.notes ?? "",
    status: mapPrStatus(item.status),
    buyerId: item.buyer?.reference ?? "anonymous",
    buyerLabel: item.buyer?.displayName ?? "Anonymous Buyer",
    locationId,
    receivedAt: iso(item.createdAt),
    responseDeadline: item.responseDeadline ?? null,
    remainingSeconds: item.remainingSeconds ?? null,
    allowedActions: item.allowedActions ?? [],
  };
}

type BackendPo = {
  id: string;
  poNumber?: string;
  referenceNumber?: string;
  orderNumber?: string;
  status: string;
  backendStatus?: string;
  paymentMethod?: string | null;
  orderValue?: unknown;
  totalAmount?: unknown;
  orderedQuantity?: unknown;
  quantity?: number;
  unitPrice?: unknown;
  productName?: string;
  gradeName?: string;
  unit?: string;
  currency?: string;
  paymentStatus?: string | null;
  dispatchStatus?: string | null;
  shipmentStatus?: string | null;
  deliveryRegion?: string | null;
  expectedDispatchDate?: string | null;
  expectedDispatchLabel?: string;
  buyer?: { displayName?: string; reference?: string };
  grade?: { id?: string; name?: string; code?: string | null } | null;
  product?: { id?: string; name?: string; code?: string | null } | null;
  createdAt?: string;
  payment?: {
    paymentOption?: string | null;
    paymentOptionLabel?: string;
    paymentStatus?: string;
  };
  proformaInvoice?: { status?: string; piNumber?: string } | null;
  dispatch?: {
    status?: string;
    plannedDispatchDate?: string | null;
  } | null;
  shipment?: { status?: string } | null;
  delivery?: { status?: string } | null;
  amounts?: { totalAmount?: unknown };
};

function buildTimelineFromStatus(
  status: SellerOrderStatus,
  createdAt: string,
): SellerOrder["timeline"] {
  const steps: Array<{
    id: string;
    label: string;
    key: SellerOrderStatus | "base";
  }> = [
    { id: "1", label: "Order Confirmed", key: "confirmed" },
    { id: "2", label: "Processing", key: "processing" },
    { id: "3", label: "Ready for Dispatch", key: "ready_for_dispatch" },
    { id: "4", label: "Dispatched", key: "in_transit" },
    { id: "5", label: "Delivered", key: "delivered" },
  ];
  const order: SellerOrderStatus[] = [
    "confirmed",
    "processing",
    "ready_for_dispatch",
    "in_transit",
    "delivered",
  ];
  if (status === "cancelled") {
    return [
      { id: "1", label: "Order Confirmed", status: "completed", at: createdAt },
      { id: "c", label: "Cancelled", status: "current" },
    ];
  }
  const currentIdx = order.indexOf(status);
  return steps.map((step, index) => ({
    id: step.id,
    label: step.label,
    status:
      index < currentIdx
        ? "completed"
        : index === currentIdx
          ? "current"
          : "pending",
    at: index === 0 ? createdAt : undefined,
  }));
}

export function mapSellerOrder(item: BackendPo, locationId = ""): SellerOrder {
  const qty = num(item.quantity ?? item.orderedQuantity);
  const value = num(
    item.orderValue ?? item.amounts?.totalAmount ?? item.totalAmount,
  );
  const unitPrice = num(item.unitPrice);
  const status = mapOrderStatus(item.status);
  const orderId =
    item.poNumber ?? item.orderNumber ?? item.referenceNumber ?? item.id;
  const gradeName =
    item.grade?.name ?? item.gradeName ?? item.productName ?? orderId;
  const productName = item.product?.name ?? item.productName ?? gradeName;
  const expectedDispatchDate = item.expectedDispatchDate
    ? iso(item.expectedDispatchDate)
    : item.dispatch?.plannedDispatchDate
      ? iso(item.dispatch.plannedDispatchDate)
      : null;
  const createdAt = iso(item.createdAt);

  return {
    id: item.id,
    orderId,
    productId: item.product?.id ?? item.id,
    category: item.grade?.code ?? item.gradeName ?? "Grade",
    gradeName: productName,
    quantityMt: qty,
    unit: item.unit ?? "MT",
    pricePerKg: unitPrice > 0 ? unitPrice : qty > 0 ? value / (qty * 1000) : 0,
    orderValue: value,
    currency: item.currency ?? "INR",
    locationId,
    locationName: "Seller warehouse",
    deliveryLocation: item.deliveryRegion ?? "Assigned Destination",
    buyerRef: item.buyer?.displayName ?? "Anonymous Buyer",
    paymentTerms: sellerPaymentMethodLabel(
      item.payment?.paymentOption ?? item.paymentMethod,
    ),
    paymentStatus: item.payment?.paymentStatus ?? item.paymentStatus ?? null,
    status,
    backendStatus: item.backendStatus ?? item.status,
    orderDate: createdAt,
    expectedDispatchDate,
    expectedDispatchLabel: expectedDispatchDate
      ? ""
      : (item.expectedDispatchLabel ?? "Not scheduled"),
    documents: [],
    timeline: buildTimelineFromStatus(status, createdAt),
    dispatchStatus: item.dispatch?.status ?? item.dispatchStatus ?? null,
    shipmentStatus: item.shipment?.status ?? item.shipmentStatus ?? null,
    deliveryStatus: item.delivery?.status ?? null,
    proformaStatus: item.proformaInvoice?.status ?? null,
  };
}

export type FetchSellerOffersParams = {
  locationId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function fetchSellerOffers(
  locationIdOrParams?: string | FetchSellerOffersParams,
): Promise<SellerOffer[]> {
  const params: FetchSellerOffersParams =
    typeof locationIdOrParams === "string"
      ? { locationId: locationIdOrParams }
      : (locationIdOrParams ?? {});

  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "all") {
    query.status = params.status.toUpperCase();
  }
  if (params.locationId) query.warehouseId = params.locationId;

  const items = await getData<BackendOffer[]>("/seller/offers", query);
  return (Array.isArray(items) ? items : []).map((item) =>
    mapSellerOffer(item, params.locationId),
  );
}

export async function fetchSellerOfferSummary(): Promise<SellerOfferSummary> {
  const response = await apiClient.get<Envelope<SellerOfferSummary>>(
    "/seller/offers/summary",
  );
  const data = response.data.data;
  return {
    active: Number(data?.active ?? 0),
    draft: Number(data?.draft ?? 0),
    paused: Number(data?.paused ?? 0),
    expired: Number(data?.expired ?? 0),
    pendingReview: Number(data?.pendingReview ?? 0),
    closed: Number(data?.closed ?? 0),
    rejected: Number(data?.rejected ?? 0),
    expiringSoon: Number(data?.expiringSoon ?? 0),
    soldOut: Number(data?.soldOut ?? 0),
    pendingPurchaseRequests: Number(data?.pendingPurchaseRequests ?? 0),
    expiringSoonWindowHours: Number(data?.expiringSoonWindowHours ?? 48),
  };
}

export async function createSellerOffer(payload: {
  productId: string;
  quantity: number;
  moq: number;
  basePrice: number;
  unit?: string;
  warehouseId?: string;
  inventoryId?: string;
  /** Preferred: server calculates validFrom/validUntil from this. */
  validityHours?: number;
  validUntil?: string;
  deliveryTerms?: string;
  paymentTerms?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  priceTiers?: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
  }>;
}) {
  const response = await apiClient.post<Envelope<BackendOffer>>(
    "/seller/offers",
    payload,
  );
  return response.data.data;
}

export async function updateSellerOffer(
  id: string,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch<Envelope<BackendOffer>>(
    `/seller/offers/${id}`,
    payload,
  );
  return response.data.data;
}

export async function activateSellerOffer(id: string) {
  await apiClient.post(`/seller/offers/${id}/activate`);
}

export async function pauseSellerOffer(id: string) {
  await apiClient.post(`/seller/offers/${id}/pause`);
}

export async function deleteSellerOffer(id: string) {
  await apiClient.delete(`/seller/offers/${id}`);
}

export async function bulkActivateSellerOffers(offerIds: string[]) {
  const response = await apiClient.post<
    Envelope<{
      total: number;
      succeeded: number;
      failed: number;
      results: Array<{ offerId: string; success: boolean; error?: string }>;
    }>
  >("/seller/offers/bulk-activate", { offerIds });
  return response.data.data;
}

export async function bulkPauseSellerOffers(offerIds: string[]) {
  const response = await apiClient.post<
    Envelope<{
      total: number;
      succeeded: number;
      failed: number;
      results: Array<{ offerId: string; success: boolean; error?: string }>;
    }>
  >("/seller/offers/bulk-pause", { offerIds });
  return response.data.data;
}

export async function fetchSellerPurchaseRequests(
  locationId: string,
): Promise<SellerPurchaseRequest[]> {
  const items = await getData<BackendPr[]>("/seller/purchase-requests", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) =>
    mapSellerPr(item, locationId),
  );
}

export async function acceptSellerPurchaseRequest(id: string) {
  await apiClient.post(`/seller/purchase-requests/${id}/accept`);
}

export async function rejectSellerPurchaseRequest(
  id: string,
  payload: { rejectionReason: string; message?: string },
) {
  await apiClient.post(`/seller/purchase-requests/${id}/reject`, payload);
}

export async function counterSellerPurchaseRequest(
  id: string,
  payload: { unitPrice: number; quantity: number; note?: string },
) {
  await apiClient.post(
    `/seller/purchase-requests/${id}/counter-offer`,
    payload,
  );
}

export async function fetchSellerOrders(
  locationIdOrParams?: string | FetchSellerOrdersParams,
): Promise<SellerOrder[]> {
  const page = await fetchSellerOrdersPage(
    typeof locationIdOrParams === "string"
      ? { page: 1, limit: 100 }
      : { page: 1, limit: 100, ...locationIdOrParams },
  );
  return page.items;
}

export async function fetchSellerOrdersPage(
  params: FetchSellerOrdersParams = {},
): Promise<SellerOrdersPage> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
  };
  const status = toSellerApiStatus(params.status);
  if (status) query.status = status;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;

  const response = await apiClient.get<Envelope<BackendPo[]>>(
    "/seller/orders",
    {
      params: query,
    },
  );
  const items = Array.isArray(response.data.data) ? response.data.data : [];
  const meta = response.data.meta ?? {};
  return {
    items: items.map((item) => mapSellerOrder(item)),
    pagination: {
      page: meta.page ?? params.page ?? 1,
      limit: meta.limit ?? params.limit ?? 20,
      total: meta.total ?? items.length,
      totalPages: meta.totalPages ?? 1,
    },
  };
}

export async function fetchSellerOrderById(id: string): Promise<SellerOrder> {
  const item = await getData<BackendPo>(`/seller/orders/${id}`);
  return mapSellerOrder(item);
}

export async function fetchSellerOrderTimeline(
  id: string,
): Promise<{ poNumber: string; events: SellerOrderTimelineEvent[] }> {
  const data = await getData<{
    poNumber?: string;
    purchaseOrderId?: string;
    events?: SellerOrderTimelineEvent[];
  }>(`/seller/orders/${id}/timeline`);
  return {
    poNumber: data.poNumber ?? id,
    events: Array.isArray(data.events) ? data.events : [],
  };
}

export async function fetchSellerOrderSummary(): Promise<SellerOrderSummary> {
  const data = await getData<Partial<SellerOrderSummary>>(
    "/seller/orders/summary",
  );
  return {
    total: num(data.total),
    confirmed: num(data.confirmed),
    processing: num(data.processing),
    readyForDispatch: num(data.readyForDispatch),
    dispatched: num(data.dispatched),
    delivered: num(data.delivered),
    cancelled: num(data.cancelled),
  };
}

export async function fetchSellerDispatches(
  locationId: string,
): Promise<SellerDispatch[]> {
  const page = await fetchSellerDispatchesPage({ page: 1, limit: 100 });
  return page.items.map((item) => ({
    id: item.id,
    orderId: item.purchaseOrderReference ?? item.purchaseOrderId,
    gradeName: item.gradeName ?? item.dispatchNumber,
    quantityMt: item.quantity,
    loadingLocation: item.loadingLocation ?? "—",
    locationId,
    vehicle: item.vehicleNumber ?? undefined,
    transporter: item.transporterName ?? undefined,
    driver: item.driverName ?? undefined,
    scheduledDate: item.plannedDispatchDate ?? item.createdAt,
    slot: item.slotLabel ?? undefined,
    buyerRef: item.buyer.displayName,
    ewayBill: item.ewayBillNumber ?? undefined,
    status: mapDispatchUiStatus(item.status),
  }));
}

function mapDispatchUiStatus(status: string): SellerDispatch["status"] {
  switch (status) {
    case "DISPATCHED":
      return "dispatched";
    case "LOADING":
    case "LOADED":
      return "loading";
    case "VEHICLE_ASSIGNED":
    case "AWAITING_EWAY_BILL":
    case "READY_FOR_DISPATCH":
      return "scheduled";
    case "DRAFT":
    case "PLANNED":
    case "AWAITING_VEHICLE":
    default:
      return "ready";
  }
}

export async function fetchSellerShipments(
  locationId: string,
): Promise<SellerShipment[]> {
  const items = await getData<Array<Record<string, unknown>>>(
    "/seller/shipments",
    {
      page: 1,
      limit: 100,
    },
  );
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    orderId: String(
      item.purchaseOrderId ?? item.purchaseOrderReference ?? item.id,
    ),
    grade: String(item.referenceNumber ?? "Shipment"),
    quantity: num(item.quantity),
    unit: "MT",
    vehicleNumber: String(item.vehicleNumber ?? "—"),
    route: String(item.destinationRegion ?? "Assigned destination"),
    status: "IN_TRANSIT",
    eta: item.eta ? iso(item.eta) : iso(item.createdAt),
    origin: "Assigned hub",
    destination: String(item.destinationRegion ?? "Assigned destination"),
    locationId,
    timeline: [],
  }));
}

export async function fetchSellerPayments(): Promise<SellerPayment[]> {
  const items = await getData<Array<Record<string, unknown>>>(
    "/seller/payments",
    {
      page: 1,
      limit: 100,
    },
  );
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    paymentId: String(item.referenceNumber ?? item.id),
    orderId: String(item.purchaseOrderId ?? item.id),
    buyerRef: "Anonymous Buyer",
    amount: num(item.amount),
    date: iso(item.createdAt),
    method: "NEFT",
    status: "processing",
    reference: String(item.utr ?? item.referenceNumber ?? item.id),
  }));
}

export async function fetchSellerSettlements(): Promise<SellerSettlement[]> {
  const items = await getData<Array<Record<string, unknown>>>(
    "/seller/settlements",
    {
      page: 1,
      limit: 100,
    },
  );

  const mapStatus = (raw: unknown): SettlementStatus => {
    const value = String(raw ?? "PENDING").toUpperCase();
    if (value === "RELEASED") return "settled";
    if (value === "PROCESSING" || value === "READY") return "processing";
    if (value === "ON_HOLD" || value === "FAILED" || value === "CANCELLED") {
      return "on_hold";
    }
    return "pending";
  };

  return (Array.isArray(items) ? items : []).map((item) => {
    const amount = num(item.netAmount ?? item.amount ?? item.totalAmount);
    const platformFee = num(item.platformFee);
    const tds = num(item.tdsAmount);
    const other = num(item.otherDeductions ?? item.deductions);
    const buyer = (item.buyer ?? {}) as Record<string, unknown>;
    return {
      id: String(item.id),
      settlementId: String(
        item.settlementNumber ?? item.referenceNumber ?? item.id,
      ),
      orderId: String(
        item.orderNumber ?? item.purchaseOrderId ?? item.orderId ?? item.id,
      ),
      buyerRef: String(buyer.displayName ?? "Anonymous Buyer"),
      amount,
      grossAmount: num(item.grossAmount ?? amount),
      gstAmount: num(item.taxAmount ?? 0),
      commission: platformFee,
      otherDeductions: other,
      deductions: num(item.deductions ?? platformFee + tds + other),
      invoiceDate: iso(item.createdAt),
      settlementDate: item.settlementDate
        ? iso(item.settlementDate)
        : item.releasedAt
          ? iso(item.releasedAt)
          : undefined,
      paymentDate: undefined,
      paymentReference: item.referenceNumber
        ? String(item.referenceNumber)
        : undefined,
      status: mapStatus(item.status),
      invoiceRef: String(
        item.invoiceNumber ?? item.proformaInvoiceNumber ?? "—",
      ),
      timeline: [],
    };
  });
}

export { fetchSellerDocuments } from "@/services/seller-documents";
