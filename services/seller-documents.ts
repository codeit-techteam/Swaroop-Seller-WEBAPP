import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import { putFileToSignedUrl } from "@/services/onboarding-documents";
import type {
  DocumentCategory,
  SellerDocumentRecord,
  SellerDocumentStatus,
} from "@/types/seller";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

/** API DocumentCategory enum values used for seller compliance docs. */
export type ApiDocumentCategory =
  | "GST"
  | "PAN"
  | "AADHAAR"
  | "BANK"
  | "KYC"
  | "MSME"
  | "ISO"
  | "COMPLIANCE"
  | "COMPLIANCE_CERTIFICATE"
  | "OTHER";

export const SELLER_DOCUMENT_UI_CATEGORIES: DocumentCategory[] = [
  "GST",
  "PAN",
  "Aadhaar",
  "Bank Proof",
  "Company Registration",
  "Address Proof",
  "Compliance Certificates",
  "Other",
];

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const UI_TO_API_CATEGORY: Record<DocumentCategory, ApiDocumentCategory> = {
  GST: "GST",
  PAN: "PAN",
  Aadhaar: "AADHAAR",
  "Bank Proof": "BANK",
  "Company Registration": "OTHER",
  "Address Proof": "OTHER",
  "Compliance Certificates": "COMPLIANCE_CERTIFICATE",
  Other: "OTHER",
};

const SLOT_DISPLAY_NAMES: Record<string, string> = {
  gst: "GST Certificate",
  pan: "PAN Card",
  aadhaar: "Aadhaar",
  cancelledCheque: "Cancelled Cheque",
};

type ApiDocument = {
  id: string;
  documentNumber?: string;
  category?: string;
  fileName?: string;
  originalFileName?: string;
  mimeType?: string | null;
  fileSizeBytes?: string | null;
  status?: string;
  approved?: boolean;
  version?: number;
  expiresAt?: string | null;
  rejectionReason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

function readMeta(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function iso(value: unknown) {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

export function mapApiCategoryToUi(category?: string): DocumentCategory {
  const key = (category ?? "").toUpperCase();
  switch (key) {
    case "GST":
      return "GST";
    case "PAN":
      return "PAN";
    case "AADHAAR":
      return "Aadhaar";
    case "BANK":
      return "Bank Proof";
    case "COMPLIANCE":
    case "COMPLIANCE_CERTIFICATE":
    case "MSME":
    case "ISO":
      return "Compliance Certificates";
    default:
      return "Other";
  }
}

export function mapUiCategoryToApi(
  category: DocumentCategory,
): ApiDocumentCategory {
  return UI_TO_API_CATEGORY[category] ?? "OTHER";
}

export function mapApiStatusToUi(
  status?: string,
  expiresAt?: string | null,
): SellerDocumentStatus {
  const key = (status ?? "").toUpperCase();
  if (key === "VERIFIED") {
    if (expiresAt) {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      if (Number.isFinite(expiry) && expiry < now) return "expired";
      const days = (expiry - now) / (1000 * 60 * 60 * 24);
      if (Number.isFinite(days) && days <= 30) return "expiring_soon";
    }
    return "verified";
  }
  if (key === "EXPIRED") return "expired";
  if (key === "REJECTED") return "rejected";
  // UPLOADED / UNDER_REVIEW / REPLACED → awaiting admin
  return "pending_verification";
}

function documentDisplayName(item: ApiDocument): string {
  const meta = readMeta(item.metadata);
  const slot = typeof meta.slot === "string" ? meta.slot : null;
  if (slot && SLOT_DISPLAY_NAMES[slot]) return SLOT_DISPLAY_NAMES[slot];
  return String(item.originalFileName ?? item.fileName ?? "Document");
}

function isIncompleteOnboardingUpload(item: ApiDocument): boolean {
  const meta = readMeta(item.metadata);
  if (meta.purpose !== "SELLER_ONBOARDING") return false;
  return meta.r2Confirmed !== true;
}

export function mapSellerDocument(
  item: ApiDocument,
): SellerDocumentRecord | null {
  if (isIncompleteOnboardingUpload(item)) return null;
  const meta = readMeta(item.metadata);
  const fileName = String(item.originalFileName ?? item.fileName ?? "file");
  return {
    id: String(item.id),
    name: documentDisplayName(item),
    category: mapApiCategoryToUi(item.category),
    status: mapApiStatusToUi(item.status, item.expiresAt),
    uploadedAt: iso(item.createdAt),
    expiresAt: item.expiresAt ? iso(item.expiresAt) : undefined,
    fileName,
    version: Number(item.version ?? 1) || 1,
    mimeType: item.mimeType ?? undefined,
    documentNumber: item.documentNumber,
    rejectionReason:
      typeof item.rejectionReason === "string"
        ? item.rejectionReason
        : undefined,
    purpose: typeof meta.purpose === "string" ? meta.purpose : undefined,
    slot: typeof meta.slot === "string" ? meta.slot : undefined,
  };
}

export function resolveSellerDocumentMime(file: File): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return file.type || "application/octet-stream";
}

export function assertSellerDocumentFile(file: File): string {
  const mimeType = resolveSellerDocumentMime(file);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("Only PDF, JPEG, PNG, or WebP files are allowed.");
  }
  const maxBytes = 10 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error("File must be between 1 byte and 10 MB.");
  }
  return mimeType;
}

export function sellerDocumentsApiError(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError<Envelope<unknown>>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (!error.response) {
      return "Unable to reach PetroTrade API. Confirm the backend is running.";
    }
  }
  if (error instanceof Error && error.message === "STORAGE_UPLOAD_FAILED") {
    return "Could not store the file in R2. Check storage CORS and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchSellerDocuments(): Promise<SellerDocumentRecord[]> {
  const response = await apiClient.get<Envelope<ApiDocument[]>>(
    "/seller/documents",
    {
      params: { page: 1, limit: 100 },
    },
  );
  const items = Array.isArray(response.data.data) ? response.data.data : [];
  return items
    .map(mapSellerDocument)
    .filter((doc): doc is SellerDocumentRecord => Boolean(doc));
}

export async function fetchSellerDocumentById(
  id: string,
): Promise<SellerDocumentRecord> {
  const response = await apiClient.get<Envelope<ApiDocument>>(
    `/seller/documents/${id}`,
  );
  const mapped = mapSellerDocument(response.data.data);
  if (!mapped) {
    throw new Error("Document is not available yet.");
  }
  return mapped;
}

export async function getSellerDocumentDownloadUrl(
  id: string,
): Promise<{ url: string; fileName?: string; mimeType?: string }> {
  const response = await apiClient.get<
    Envelope<{ url: string; fileName?: string; mimeType?: string }>
  >(`/seller/documents/${id}/download`);
  const data = response.data.data;
  if (!data?.url) throw new Error("Download URL was not issued");
  return data;
}

export async function getSellerDocumentPreviewUrl(
  id: string,
): Promise<{ url: string; fileName?: string; mimeType?: string }> {
  const response = await apiClient.get<
    Envelope<{ url: string; fileName?: string; mimeType?: string }>
  >(`/seller/documents/${id}/preview`);
  const data = response.data.data;
  if (!data?.url) throw new Error("Preview URL was not issued");
  return data;
}

async function deleteSellerDocumentQuietly(id: string) {
  try {
    await apiClient.delete(`/seller/documents/${id}`);
  } catch {
    // Best-effort cleanup after a failed R2 PUT.
  }
}

export async function uploadSellerDocument(input: {
  category: DocumentCategory;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<SellerDocumentRecord> {
  const mimeType = assertSellerDocumentFile(input.file);
  const apiCategory = mapUiCategoryToApi(input.category);

  const createResponse = await apiClient.post<
    Envelope<ApiDocument & { uploadUrl?: string | null }>
  >("/seller/documents/upload", {
    category: apiCategory,
    fileName: input.file.name,
    mimeType,
    fileSizeBytes: input.file.size,
    metadata: {
      purpose: "SELLER_PANEL",
      uiCategory: input.category,
    },
  });

  const created = createResponse.data.data;
  if (!created?.id || !created.uploadUrl) {
    throw new Error("Storage upload URL was not issued");
  }

  try {
    const { promise } = putFileToSignedUrl(
      created.uploadUrl,
      input.file,
      mimeType,
      input.onProgress ?? (() => undefined),
    );
    await promise;
  } catch (error) {
    await deleteSellerDocumentQuietly(created.id);
    throw error;
  }

  const confirmed = await apiClient.post<Envelope<ApiDocument>>(
    `/seller/documents/${created.id}/confirm`,
  );

  return (
    mapSellerDocument({
      ...created,
      ...confirmed.data.data,
      originalFileName: input.file.name,
      mimeType,
      status: confirmed.data.data?.status ?? "UNDER_REVIEW",
      metadata: {
        purpose: "SELLER_PANEL",
        uiCategory: input.category,
        r2Confirmed: true,
        awaitingAdminReview: true,
      },
    }) ?? {
      id: created.id,
      name: input.file.name,
      category: input.category,
      status: "pending_verification",
      uploadedAt: new Date().toISOString(),
      fileName: input.file.name,
      version: 1,
      mimeType,
    }
  );
}

export async function replaceSellerDocument(input: {
  id: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<SellerDocumentRecord> {
  const mimeType = assertSellerDocumentFile(input.file);

  const replaceResponse = await apiClient.post<
    Envelope<ApiDocument & { uploadUrl?: string | null }>
  >(`/seller/documents/${input.id}/replace`, {
    fileName: input.file.name,
    mimeType,
    fileSizeBytes: input.file.size,
  });

  const replaced = replaceResponse.data.data;
  if (!replaced?.id) {
    throw new Error("Document replace failed");
  }
  if (!replaced.uploadUrl) {
    throw new Error("Storage upload URL was not issued");
  }

  const { promise } = putFileToSignedUrl(
    replaced.uploadUrl,
    input.file,
    mimeType,
    input.onProgress ?? (() => undefined),
  );
  await promise;

  // Re-confirm so admin queue sees a fresh UNDER_REVIEW after replacement.
  const confirmed = await apiClient
    .post<Envelope<ApiDocument>>(`/seller/documents/${replaced.id}/confirm`)
    .catch(() => null);

  const latest = confirmed?.data.data ?? replaced;

  return (
    mapSellerDocument({
      ...replaced,
      ...latest,
      originalFileName: input.file.name,
      mimeType,
      status: latest.status ?? "UNDER_REVIEW",
      rejectionReason: null,
    }) ?? {
      id: replaced.id,
      name: input.file.name,
      category: mapApiCategoryToUi(replaced.category),
      status: "pending_verification",
      uploadedAt: new Date().toISOString(),
      fileName: input.file.name,
      version: Number(replaced.version ?? 1) || 1,
      mimeType,
    }
  );
}

export function openSignedDocumentUrl(url: string, fileName?: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  if (fileName) anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
