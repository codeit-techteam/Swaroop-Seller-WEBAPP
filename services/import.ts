import type { AxiosRequestConfig } from "axios";

import { sidePath } from "@/lib/import/config";
import { apiClient as http } from "@/services/apiClient";
import type {
  ImportBrand,
  ImportDeal,
  ImportDocument,
  ImportGrade,
  ImportListing,
  ImportListingInput,
  ImportMasterBundle,
  ImportMatch,
  ImportNegotiation,
  ImportNegotiationDetail,
  ImportPaymentTerm,
  ImportPort,
  ImportProduct,
  ImportSide,
  ImportSummary,
  ImportTermsInput,
  Paged,
} from "@/types/import";

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

/** Resolves to the response body (the `{ success, data, meta }` envelope). */
const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    http.get<T>(url, config).then((r) => r.data),
  post: <T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => http.post<T>(url, body, config).then((r) => r.data),
  patch: <T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => http.patch<T>(url, body, config).then((r) => r.data),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(url, config).then((r) => r.data),
};

type Query = Record<string, string | number | undefined | null>;

function qs(query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function data<T>(p: Promise<Envelope<T>>): Promise<T> {
  return (await p).data;
}

async function paged<T>(p: Promise<Envelope<T[]>>): Promise<Paged<T>> {
  const res = await p;
  return {
    items: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

const idem = (key?: string) =>
  key ? { headers: { "Idempotency-Key": key } } : undefined;

// Config & master data ------------------------------------------------------

export const fetchImportConfig = () =>
  data(
    apiClient.get<Envelope<{ enabled: boolean; serverTime: string }>>(
      "/import/config",
    ),
  );

export const fetchImportSummary = () =>
  data(apiClient.get<Envelope<ImportSummary>>("/import/summary"));

export const fetchImportMaster = () =>
  data(apiClient.get<Envelope<ImportMasterBundle>>("/import/master-data"));

export const fetchImportProducts = (search?: string) =>
  data(
    apiClient.get<Envelope<ImportProduct[]>>(
      `/import/master-data/products${qs({ search })}`,
    ),
  );

export const fetchImportGrades = (categoryId?: string, search?: string) =>
  data(
    apiClient.get<Envelope<ImportGrade[]>>(
      `/import/master-data/grades${qs({ categoryId, search, limit: 50 })}`,
    ),
  );

export const fetchImportBrands = (search?: string) =>
  data(
    apiClient.get<Envelope<ImportBrand[]>>(
      `/import/master-data/brands${qs({ search })}`,
    ),
  );

export const fetchImportPorts = (search?: string, countryCode?: string) =>
  data(
    apiClient.get<Envelope<ImportPort[]>>(
      `/import/master-data/ports${qs({ search, countryCode })}`,
    ),
  );

export const fetchImportPaymentTerms = (currencyCode?: string) =>
  data(
    apiClient.get<Envelope<ImportPaymentTerm[]>>(
      `/import/master-data/payment-terms${qs({ currencyCode })}`,
    ),
  );

// Listings ------------------------------------------------------------------

export type ListingQuery = {
  scope?: "mine" | "market";
  status?: string;
  search?: string;
  categoryId?: string;
  originCountryId?: string;
  incotermId?: string;
  polId?: string;
  podId?: string;
  currencyCode?: string;
  priceMin?: string;
  priceMax?: string;
  quantityMin?: string;
  quantityMax?: string;
  shipmentFrom?: string;
  shipmentTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export const fetchListings = (side: ImportSide, query: ListingQuery) =>
  paged(
    apiClient.get<Envelope<ImportListing[]>>(
      `${sidePath(side)}${qs(query as Query)}`,
    ),
  );

export const fetchListing = (side: ImportSide, id: string) =>
  data(apiClient.get<Envelope<ImportListing>>(`${sidePath(side)}/${id}`));

export const createListing = (side: ImportSide, input: ImportListingInput) =>
  data(
    apiClient.post<Envelope<ImportListing>>(sidePath(side), {
      ...input,
      source: "WEB",
    }),
  );

export const updateListing = (
  side: ImportSide,
  id: string,
  input: ImportListingInput & { version: number },
) =>
  data(
    apiClient.patch<Envelope<ImportListing>>(`${sidePath(side)}/${id}`, input),
  );

export const deleteListing = (side: ImportSide, id: string) =>
  apiClient.delete(`${sidePath(side)}/${id}`);

export const publishListing = (
  side: ImportSide,
  id: string,
  idempotencyKey: string,
) =>
  data(
    apiClient.post<Envelope<ImportListing>>(
      `${sidePath(side)}/${id}/publish`,
      {},
      idem(idempotencyKey),
    ),
  );

export const transitionListing = (
  side: ImportSide,
  id: string,
  action: "cancel" | "expire" | "pause" | "resume",
  reason?: string,
) =>
  data(
    apiClient.post<Envelope<ImportListing>>(
      `${sidePath(side)}/${id}/${action}`,
      action === "cancel" ? { reason } : {},
    ),
  );

export const fetchMatches = (side: ImportSide, id: string) =>
  data(
    apiClient.get<Envelope<ImportMatch[]>>(`${sidePath(side)}/${id}/matches`),
  );

export const dismissMatch = (side: ImportSide, id: string, matchId: string) =>
  apiClient.post(`${sidePath(side)}/${id}/matches/${matchId}/dismiss`);

// Documents -----------------------------------------------------------------

export const fetchListingDocuments = (listingId: string) =>
  data(
    apiClient.get<Envelope<ImportDocument[]>>(
      `/import/listings/${listingId}/documents`,
    ),
  );

function putToSignedUrl(url: string, file: File, mimeType: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("File upload to storage failed."));
    xhr.onerror = () => reject(new Error("File upload to storage failed."));
    xhr.send(file);
  });
}

/** Creates the document row, uploads to the signed R2 URL, then confirms. */
export async function uploadListingDocument(
  listingId: string,
  category: string,
  file: File,
): Promise<void> {
  const mimeType = file.type || "application/octet-stream";
  const created = await data(
    apiClient.post<Envelope<{ id: string; uploadUrl?: string | null }>>(
      `/import/listings/${listingId}/documents`,
      {
        category,
        fileName: file.name,
        mimeType,
        fileSizeBytes: file.size,
      },
    ),
  );
  if (!created?.id || !created.uploadUrl) {
    throw new Error("Storage upload URL was not issued. Please try again.");
  }
  try {
    await putToSignedUrl(created.uploadUrl, file, mimeType);
    await apiClient.post(
      `/import/listings/${listingId}/documents/${created.id}/confirm`,
    );
  } catch (error) {
    await apiClient
      .delete(`/import/listings/${listingId}/documents/${created.id}`)
      .catch(() => undefined);
    throw error;
  }
}

export const downloadListingDocument = (
  listingId: string,
  documentId: string,
) =>
  data(
    apiClient.get<Envelope<{ url: string }>>(
      `/import/listings/${listingId}/documents/${documentId}/download`,
    ),
  );

export const deleteListingDocument = (listingId: string, documentId: string) =>
  apiClient.delete(`/import/listings/${listingId}/documents/${documentId}`);

// Negotiations & deals ------------------------------------------------------

export const fetchNegotiations = (query: {
  status?: string;
  listingId?: string;
  search?: string;
  as?: "buyer" | "seller";
  page?: number;
  limit?: number;
}) =>
  paged(
    apiClient.get<Envelope<ImportNegotiation[]>>(
      `/import/negotiations${qs(query)}`,
    ),
  );

export const fetchNegotiation = (id: string) =>
  data(
    apiClient.get<Envelope<ImportNegotiationDetail>>(
      `/import/negotiations/${id}`,
    ),
  );

export const openNegotiation = (
  input: ImportTermsInput & {
    listingId: string;
    counterListingId?: string;
    price: string;
    quantity: string;
  },
  idempotencyKey: string,
) =>
  data(
    apiClient.post<Envelope<ImportNegotiationDetail>>(
      "/import/negotiations",
      input,
      idem(idempotencyKey),
    ),
  );

export const counterNegotiation = (
  id: string,
  input: ImportTermsInput,
  idempotencyKey: string,
) =>
  data(
    apiClient.post<Envelope<ImportNegotiationDetail>>(
      `/import/negotiations/${id}/counter`,
      input,
      idem(idempotencyKey),
    ),
  );

export const acceptNegotiation = (id: string, idempotencyKey: string) =>
  data(
    apiClient.post<Envelope<ImportNegotiationDetail>>(
      `/import/negotiations/${id}/accept`,
      {},
      idem(idempotencyKey),
    ),
  );

export const closeNegotiation = (
  id: string,
  action: "reject" | "withdraw",
  note?: string,
) =>
  apiClient.post(`/import/negotiations/${id}/${action}`, note ? { note } : {});

export const fetchDeals = (query: {
  status?: string;
  as?: "buyer" | "seller";
  page?: number;
  limit?: number;
}) => paged(apiClient.get<Envelope<ImportDeal[]>>(`/import/deals${qs(query)}`));

export const fetchDeal = (id: string) =>
  data(apiClient.get<Envelope<ImportDeal>>(`/import/deals/${id}`));

export const confirmDeal = (id: string, idempotencyKey: string) =>
  data(
    apiClient.post<Envelope<ImportDeal>>(
      `/import/deals/${id}/confirm`,
      {},
      idem(idempotencyKey),
    ),
  );
