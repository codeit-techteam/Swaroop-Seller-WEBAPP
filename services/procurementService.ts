import { apiClient } from "@/services/apiClient";
import type {
  AlertKind,
  DispatchStatus,
  PaymentStatus,
  ProcurementPriority,
  ProcurementRecord,
  ProcurementStage,
  SellerOpsBundle,
} from "@/types/seller-ops";

const ANONYMOUS_BUYER = "Anonymous Buyer";

type Envelope<T> = {
  success?: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

export type SellerWorkbenchItemDto = {
  id: string;
  referenceId: string;
  purchaseRequestId: string;
  orderId?: string | null;
  priceRevisionId?: string | null;
  buyerDisplayName: string;
  productId?: string | null;
  productName: string;
  gradeId?: string | null;
  gradeName: string;
  quantity: number;
  quantityUnit?: string;
  currentStage: ProcurementStage;
  orderValue: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  dispatchStatus: DispatchStatus;
  settlementStatus?: string | null;
  priority: ProcurementPriority;
  deliveryLocation?: string;
  expectedDelivery?: string | null;
  warehouseName?: string | null;
  paymentTerms?: string;
  lastUpdatedAt: string;
  overdue?: boolean;
  delayed?: boolean;
  poAcknowledged?: boolean;
  documentsMissing?: boolean;
  commercial?: ProcurementRecord["commercial"];
  order?: ProcurementRecord["order"];
  payment?: ProcurementRecord["payment"];
  fulfillment?: ProcurementRecord["fulfillment"];
  documents?: ProcurementRecord["documents"];
  timeline?: ProcurementRecord["timeline"];
  activity?: ProcurementRecord["activity"];
  alerts?: AlertKind[];
};

export type SellerWorkbenchSummary = {
  kpis: {
    openPurchaseRequests: number;
    pendingPriceRevisions: number;
    confirmedOrders: number;
    awaitingPayment: number;
    readyForDispatch: number;
    inTransit: number;
    settlementPending: number;
  };
  pipeline: Record<string, number>;
  actionRequired: Record<string, number>;
  total: number;
};

export type SellerWorkbenchPage = {
  items: ProcurementRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SellerWorkbenchQuery = {
  page?: number;
  limit?: number;
  search?: string;
  stage?: ProcurementStage | "ALL";
  gradeId?: string;
  priority?: ProcurementPriority | "all";
  paymentStatus?: PaymentStatus | "all";
  dispatchStatus?: DispatchStatus | "all";
  alert?: AlertKind | "ALL";
  date?: string;
  fromDate?: string;
  toDate?: string;
};

function mapWorkbenchItem(raw: SellerWorkbenchItemDto): ProcurementRecord {
  const quantityMt = Number(raw.quantity) || 0;
  const orderValue = Number(raw.orderValue) || 0;
  const paymentTerms =
    (raw.paymentTerms as ProcurementRecord["paymentTerms"]) || "Other";

  return {
    id: raw.id,
    purchaseRequestId: raw.purchaseRequestId || raw.referenceId,
    orderId: raw.orderId ?? undefined,
    priceRevisionId: raw.priceRevisionId ?? undefined,
    vehicleSlotId: raw.fulfillment?.vehicleSlotId ?? undefined,
    buyerDisplayName: ANONYMOUS_BUYER,
    productId: raw.productId ?? "",
    productName: raw.productName,
    gradeId: raw.gradeId ?? "",
    gradeName: raw.gradeName,
    quantityMt,
    currentStage: raw.currentStage,
    orderValue,
    paymentStatus: raw.paymentStatus,
    dispatchStatus: raw.dispatchStatus,
    settlementStatus:
      (raw.settlementStatus as ProcurementRecord["settlementStatus"]) ??
      undefined,
    priority: raw.priority,
    deliveryLocation: raw.deliveryLocation ?? "Assigned destination",
    expectedDelivery: raw.expectedDelivery ?? new Date().toISOString(),
    warehouseName: raw.warehouseName ?? undefined,
    paymentTerms,
    lastUpdated: raw.lastUpdatedAt,
    overdue: Boolean(raw.overdue),
    delayed: Boolean(raw.delayed),
    poAcknowledged: Boolean(raw.poAcknowledged),
    documentsMissing: Boolean(raw.documentsMissing),
    commercial: raw.commercial ?? {
      originalPrice: 0,
      requestedPrice: 0,
      paymentTerms,
      deliveryTerms: raw.deliveryLocation ?? "Assigned destination",
    },
    order: raw.order ?? {
      poNumber: raw.orderId ?? undefined,
      orderNumber: raw.orderId ?? undefined,
      quantityMt,
      dispatchStatus: raw.dispatchStatus,
    },
    payment: raw.payment ?? {
      method: paymentTerms,
      status: raw.paymentStatus,
      amountPaid: 0,
      amountPending: orderValue,
      dueDate: raw.expectedDelivery ?? new Date().toISOString(),
      orderValue,
    },
    fulfillment: raw.fulfillment ?? {
      trackingStatus: raw.dispatchStatus,
    },
    documents: raw.documents ?? [],
    timeline: raw.timeline ?? [],
    activity: raw.activity ?? [],
    alerts: raw.alerts ?? [],
  };
}

export async function fetchSellerProcurementWorkbench(
  params: SellerWorkbenchQuery = {},
): Promise<SellerWorkbenchPage> {
  const response = await apiClient.get<Envelope<SellerWorkbenchItemDto[]>>(
    "/seller/procurement/workbench",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        search: params.search?.trim() || undefined,
        stage:
          params.stage && params.stage !== "ALL" ? params.stage : undefined,
        gradeId: params.gradeId || undefined,
        priority:
          params.priority && params.priority !== "all"
            ? params.priority
            : undefined,
        paymentStatus:
          params.paymentStatus && params.paymentStatus !== "all"
            ? params.paymentStatus
            : undefined,
        dispatchStatus:
          params.dispatchStatus && params.dispatchStatus !== "all"
            ? params.dispatchStatus
            : undefined,
        alert:
          params.alert && params.alert !== "ALL" ? params.alert : undefined,
        date: params.date || undefined,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
      },
    },
  );

  const items = Array.isArray(response.data.data)
    ? response.data.data.map(mapWorkbenchItem)
    : [];
  const meta = response.data.meta ?? {};

  return {
    items,
    meta: {
      page: meta.page ?? params.page ?? 1,
      limit: meta.limit ?? params.limit ?? 100,
      total: meta.total ?? items.length,
      totalPages: meta.totalPages ?? 1,
    },
  };
}

export async function fetchSellerProcurementWorkbenchSummary(): Promise<SellerWorkbenchSummary> {
  const response = await apiClient.get<Envelope<SellerWorkbenchSummary>>(
    "/seller/procurement/workbench/summary",
  );
  return response.data.data;
}

export async function fetchSellerProcurementWorkbenchDetail(
  id: string,
): Promise<ProcurementRecord> {
  const response = await apiClient.get<Envelope<SellerWorkbenchItemDto>>(
    `/seller/procurement/workbench/${id}`,
  );
  return mapWorkbenchItem(response.data.data);
}

/** Production bootstrap — real backend only, blind buyer labels. */
export async function getSellerOpsBundle(): Promise<SellerOpsBundle> {
  const page = await fetchSellerProcurementWorkbench({ page: 1, limit: 100 });
  return {
    purchaseRequests: [],
    priceRevisions: [],
    vehicleSlots: [],
    procurementRecords: page.items,
  };
}

export async function getProcurementRecords() {
  const page = await fetchSellerProcurementWorkbench({ page: 1, limit: 100 });
  return page.items;
}

export async function getPriceRevisions() {
  return [];
}

export async function getVehicleSlots() {
  return [];
}
