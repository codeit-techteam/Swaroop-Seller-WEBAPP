import type {
  SellerPriceRevision,
  SellerPriceRevisionListParams,
  SellerPriceRevisionPage,
  SellerPriceRevisionSummary,
} from "@/types/seller-price-revision";

import { apiClient } from "./apiClient";

type Envelope<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

function unwrapData<T>(response: { data: Envelope<T> }): T {
  return response.data.data;
}

function mapRevision(raw: SellerPriceRevision): SellerPriceRevision {
  return {
    ...raw,
    buyer: {
      displayName: raw.buyer?.displayName ?? "Anonymous Buyer",
      reference: raw.buyer?.reference ?? "BUYER-UNKNOWN",
    },
    originalPrice: Number(raw.originalPrice) || 0,
    requestedPrice: Number(raw.requestedPrice) || 0,
    differenceAmount: Number(raw.differenceAmount) || 0,
    differencePercent: Number(raw.differencePercent) || 0,
    quantity: Number(raw.quantity) || 0,
    totalValue: Number(raw.totalValue) || 0,
    counterPrice:
      raw.counterPrice == null ? null : Number(raw.counterPrice) || 0,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    allowedActions: Array.isArray(raw.allowedActions) ? raw.allowedActions : [],
  };
}

export async function fetchSellerPriceRevisionsPage(
  params: SellerPriceRevisionListParams = {},
): Promise<SellerPriceRevisionPage> {
  const response = await apiClient.get<Envelope<SellerPriceRevision[]>>(
    "/seller/price-revisions",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        status:
          params.status && params.status !== "ALL" ? params.status : undefined,
        gradeId: params.gradeId,
        from: params.from || undefined,
        to: params.to || undefined,
        sort: params.sort ?? "newest",
        search: params.search?.trim() || undefined,
      },
    },
  );
  const items = Array.isArray(response.data.data)
    ? response.data.data.map(mapRevision)
    : [];
  const meta = response.data.meta ?? {};
  return {
    items,
    meta: {
      page: meta.page ?? params.page ?? 1,
      limit: meta.limit ?? params.limit ?? 20,
      total: meta.total ?? items.length,
      totalPages: meta.totalPages ?? 1,
    },
  };
}

export async function fetchSellerPriceRevisionSummary(): Promise<SellerPriceRevisionSummary> {
  const data = unwrapData(
    await apiClient.get<Envelope<Partial<SellerPriceRevisionSummary>>>(
      "/seller/price-revisions/summary",
    ),
  );
  return {
    pending: Number(data.pending) || 0,
    awaitingResponse: Number(data.awaitingResponse) || 0,
    accepted: Number(data.accepted) || 0,
    counterOffers: Number(data.counterOffers) || 0,
    rejected: Number(data.rejected) || 0,
    expired: Number(data.expired) || 0,
    cancelled: Number(data.cancelled) || 0,
  };
}

export async function fetchSellerPriceRevision(
  id: string,
): Promise<SellerPriceRevision> {
  return mapRevision(
    unwrapData(
      await apiClient.get<Envelope<SellerPriceRevision>>(
        `/seller/price-revisions/${id}`,
      ),
    ),
  );
}

export async function fetchSellerPriceRevisionTimeline(id: string) {
  return unwrapData(
    await apiClient.get<
      Envelope<{
        id: string;
        requestNumber: string;
        status: string;
        buyer: { displayName: string; reference: string };
        timeline: SellerPriceRevision["timeline"];
      }>
    >(`/seller/price-revisions/${id}/timeline`),
  );
}

export async function acceptSellerPriceRevision(id: string, message?: string) {
  return unwrapData(
    await apiClient.post(`/seller/price-revisions/${id}/accept`, { message }),
  );
}

export async function rejectSellerPriceRevision(id: string, reason: string) {
  return unwrapData(
    await apiClient.post(`/seller/price-revisions/${id}/reject`, {
      reason,
      message: reason,
    }),
  );
}

export async function counterSellerPriceRevision(
  id: string,
  payload: { counterPrice: number; message?: string; counterQuantity?: number },
) {
  return unwrapData(
    await apiClient.post(`/seller/price-revisions/${id}/counter`, payload),
  );
}

export function priceRevisionApiError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unable to complete price revision action.";
  }
  const err = error as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    message?: string;
  };
  const status = err.response?.status;
  const msg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "";
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 403) return "Access denied.";
  if (status === 404) return "Price revision not found.";
  if (status === 409) {
    return msg || "This price revision has already been responded to.";
  }
  if (status === 422) return msg || "Invalid price revision request.";
  if (msg.toLowerCase().includes("deadline")) {
    return "Response deadline has expired.";
  }
  return msg || "Unable to complete price revision action.";
}
