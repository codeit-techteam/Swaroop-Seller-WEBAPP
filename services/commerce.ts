import { apiClient } from "@/services/apiClient";
import { sellerPaymentMethodLabel } from "@/lib/seller/payment";
import type {
  OfferStatus,
  PurchaseRequestStatus,
  SellerDispatch,
  SellerDocumentRecord,
  SellerOffer,
  SellerOrder,
  SellerOrderStatus,
  SellerPayment,
  SellerPurchaseRequest,
  SellerSettlement,
  SellerShipment,
  SettlementStatus,
} from "@/types/seller";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { total?: number; totalPages?: number };
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function iso(value: unknown) {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<Envelope<T>>(url, { params });
  return (response.data.data ?? []) as T;
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
  const key = (status ?? "").toUpperCase();
  if (key.includes("CANCEL")) return "cancelled";
  if (key.includes("DELIVER")) return "delivered";
  if (key.includes("TRANSIT") || key.includes("DISPATCH")) return "in_transit";
  if (key.includes("READY")) return "ready_for_dispatch";
  if (key.includes("PROCESS")) return "processing";
  return "confirmed";
}

type BackendOffer = {
  id: string;
  productId?: string;
  product?: { id?: string; name?: string };
  grade?: { code?: string; name?: string; displayName?: string | null };
  basePrice?: unknown;
  quantity?: unknown;
  moq?: unknown;
  unit?: string;
  validUntil?: string | null;
  paymentTerms?: unknown;
  deliveryTerms?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function mapSellerOffer(item: BackendOffer, locationId: string): SellerOffer {
  return {
    id: item.id,
    sellerId: "self",
    locationId,
    productId: item.productId ?? item.product?.id ?? item.id,
    category: item.grade?.name ?? "Grade",
    gradeName: item.product?.name ?? item.grade?.displayName ?? item.grade?.name ?? "Offer",
    manufacturer: "PRIVATE",
    price: num(item.basePrice),
    unit: item.unit ?? "MT",
    availableQty: num(item.quantity),
    moq: num(item.moq),
    validityHours: 24,
    validUntil: item.validUntil ? iso(item.validUntil) : iso(Date.now() + 86400000),
    paymentTerms: sellerPaymentMethodLabel(
      typeof item.paymentTerms === "string"
        ? item.paymentTerms
        : JSON.stringify(item.paymentTerms ?? "ADVANCE"),
    ),
    deliveryLocation: item.deliveryTerms ?? "Assigned hub",
    remarks: "",
    gstPercent: 18,
    bulkPricing: [],
    status: mapOfferStatus(item.status),
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
  buyer?: { displayName?: string };
  items?: Array<{
    product?: { id?: string; name?: string } | null;
    grade?: { name?: string; code?: string } | null;
    quantity?: unknown;
    targetUnitPrice?: unknown;
  }>;
};

export function mapSellerPr(item: BackendPr, locationId: string): SellerPurchaseRequest {
  const line = item.items?.[0];
  return {
    id: item.id,
    requestNumber: item.referenceNumber,
    productId: line?.product?.id ?? item.id,
    category: line?.grade?.name ?? "Grade",
    gradeName: line?.product?.name ?? line?.grade?.name ?? "Purchase request",
    quantityMt: num(line?.quantity),
    requestedPrice: num(line?.targetUnitPrice ?? item.targetPrice),
    deliveryLocation: item.destinationRegion ?? "Assigned destination",
    requestedDeliveryDate: iso(item.createdAt).slice(0, 10),
    paymentTerms: sellerPaymentMethodLabel(item.paymentMethod),
    notes: item.notes ?? "",
    status: mapPrStatus(item.status),
    buyerId: "anonymous",
    buyerLabel: item.buyer?.displayName ?? "ANONYMOUS BUYER",
    locationId,
    receivedAt: iso(item.createdAt),
  };
}

type BackendPo = {
  id: string;
  referenceNumber?: string;
  orderNumber?: string;
  status: string;
  paymentMethod?: string | null;
  totalAmount?: unknown;
  orderedQuantity?: unknown;
  quantity?: number;
  productName?: string;
  gradeName?: string;
  unit?: string;
  paymentStatus?: string | null;
  dispatchStatus?: string | null;
  shipmentStatus?: string | null;
  createdAt?: string;
};

export function mapSellerOrder(item: BackendPo, locationId: string): SellerOrder {
  const qty = num(item.quantity ?? item.orderedQuantity);
  const value = num(item.totalAmount);
  const status = mapOrderStatus(
    item.shipmentStatus ?? item.dispatchStatus ?? item.status,
  );
  const orderId = item.orderNumber ?? item.referenceNumber ?? item.id;
  return {
    id: item.id,
    orderId,
    productId: item.id,
    category: item.gradeName ?? "Grade",
    gradeName: item.productName ?? item.gradeName ?? orderId,
    quantityMt: qty,
    pricePerKg: qty > 0 ? value / (qty * 1000) : 0,
    orderValue: value,
    locationId,
    locationName: "Assigned hub",
    deliveryLocation: "Assigned destination",
    buyerRef: "ANONYMOUS BUYER",
    paymentTerms: sellerPaymentMethodLabel(item.paymentMethod),
    status,
    orderDate: iso(item.createdAt),
    documents: [],
    timeline: [
      { id: "1", label: "Order Confirmed", status: "completed", at: iso(item.createdAt) },
      {
        id: "2",
        label: "Processing",
        status: status === "confirmed" || status === "processing" ? "current" : "completed",
      },
      {
        id: "3",
        label: "Dispatch Scheduled",
        status:
          status === "ready_for_dispatch"
            ? "current"
            : status === "in_transit" || status === "delivered"
              ? "completed"
              : "pending",
      },
      {
        id: "4",
        label: "In Transit",
        status:
          status === "in_transit"
            ? "current"
            : status === "delivered"
              ? "completed"
              : "pending",
      },
      {
        id: "5",
        label: "Delivered",
        status: status === "delivered" ? "completed" : "pending",
      },
    ],
  };
}

export async function fetchSellerOffers(locationId: string): Promise<SellerOffer[]> {
  const items = await getData<BackendOffer[]>("/seller/offers", { page: 1, limit: 100 });
  return (Array.isArray(items) ? items : []).map((item) => mapSellerOffer(item, locationId));
}

export async function createSellerOffer(payload: {
  productId: string;
  quantity: number;
  moq: number;
  basePrice: number;
  validUntil?: string;
  deliveryTerms?: string;
  paymentTerms?: Record<string, unknown>;
}) {
  const response = await apiClient.post<Envelope<BackendOffer>>("/seller/offers", payload);
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

export async function fetchSellerPurchaseRequests(locationId: string): Promise<SellerPurchaseRequest[]> {
  const items = await getData<BackendPr[]>("/seller/purchase-requests", { page: 1, limit: 100 });
  return (Array.isArray(items) ? items : []).map((item) => mapSellerPr(item, locationId));
}

export async function acceptSellerPurchaseRequest(id: string) {
  await apiClient.post(`/seller/purchase-requests/${id}/accept`);
}

export async function rejectSellerPurchaseRequest(id: string) {
  await apiClient.post(`/seller/purchase-requests/${id}/reject`);
}

export async function counterSellerPurchaseRequest(
  id: string,
  payload: { unitPrice: number; quantity: number; note?: string },
) {
  await apiClient.post(`/seller/purchase-requests/${id}/counter-offer`, payload);
}

export async function fetchSellerOrders(locationId: string): Promise<SellerOrder[]> {
  const items = await getData<BackendPo[]>("/seller/purchase-orders", { page: 1, limit: 100 });
  return (Array.isArray(items) ? items : []).map((item) => mapSellerOrder(item, locationId));
}

export async function fetchSellerDispatches(locationId: string): Promise<SellerDispatch[]> {
  const items = await getData<Array<Record<string, unknown>>>("/seller/dispatches", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    orderId: String(item.purchaseOrderId ?? item.purchaseOrderReference ?? item.id),
    gradeName: String(item.dispatchNumber ?? item.referenceNumber ?? "Dispatch"),
    quantityMt: num(item.quantity),
    loadingLocation: "Assigned hub",
    locationId,
    vehicle: item.vehicleNumber ? String(item.vehicleNumber) : undefined,
    transporter: item.transporterName ? String(item.transporterName) : undefined,
    driver: item.driverName ? String(item.driverName) : undefined,
    scheduledDate: iso(item.scheduledAt ?? item.createdAt),
    slot: item.slot ? String(item.slot) : undefined,
    buyerRef: "ANONYMOUS BUYER",
    ewayBill: item.ewayBillNumber ? String(item.ewayBillNumber) : undefined,
    status: String(item.status ?? "scheduled").toLowerCase() as SellerDispatch["status"],
  }));
}

export async function fetchSellerShipments(locationId: string): Promise<SellerShipment[]> {
  const items = await getData<Array<Record<string, unknown>>>("/seller/shipments", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    orderId: String(item.purchaseOrderId ?? item.purchaseOrderReference ?? item.id),
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
  const items = await getData<Array<Record<string, unknown>>>("/seller/payments", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    paymentId: String(item.referenceNumber ?? item.id),
    orderId: String(item.purchaseOrderId ?? item.id),
    buyerRef: "ANONYMOUS BUYER",
    amount: num(item.amount),
    date: iso(item.createdAt),
    method: "NEFT",
    status: "processing",
    reference: String(item.utr ?? item.referenceNumber ?? item.id),
  }));
}

export async function fetchSellerSettlements(): Promise<SellerSettlement[]> {
  const items = await getData<Array<Record<string, unknown>>>("/seller/settlements", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) => {
    const amount = num(item.netAmount ?? item.amount ?? item.totalAmount);
    return {
      id: String(item.id),
      settlementId: String(item.referenceNumber ?? item.id),
      orderId: String(item.purchaseOrderId ?? item.id),
      buyerRef: "ANONYMOUS BUYER",
      amount,
      grossAmount: num(item.grossAmount ?? amount),
      gstAmount: num(item.taxAmount ?? 0),
      commission: num(item.commission ?? 0),
      otherDeductions: num(item.deductions ?? 0),
      deductions: num(item.deductions ?? 0),
      invoiceDate: iso(item.createdAt),
      settlementDate: item.settledAt ? iso(item.settledAt) : undefined,
      paymentDate: item.paidAt ? iso(item.paidAt) : undefined,
      paymentReference: item.referenceNumber ? String(item.referenceNumber) : undefined,
      status: "pending",
      invoiceRef: String(item.referenceNumber ?? item.id),
      timeline: [],
    };
  });
}

export async function fetchSellerDocuments(): Promise<SellerDocumentRecord[]> {
  const items = await getData<Array<Record<string, unknown>>>("/seller/documents", {
    page: 1,
    limit: 100,
  });
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item.id),
    name: String(item.title ?? item.fileName ?? "Document"),
    category: "GST",
    status: "verified",
    uploadedAt: iso(item.createdAt),
    fileName: String(item.fileName ?? item.title ?? "file"),
    version: 1,
  }));
}
