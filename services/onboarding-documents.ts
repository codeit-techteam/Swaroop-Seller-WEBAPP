import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import type { DocumentItem, DocumentStatus } from "@/types/onboarding";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
};

export type OnboardingDocumentSlotCode =
  "gst" | "pan" | "aadhaar" | "cancelledCheque";

export type StoredOnboardingDocument = {
  id: string;
  slot: string | null;
  category: string;
  fileName: string;
  mimeType?: string | null;
  fileSizeBytes?: string | null;
  status: string;
  r2Confirmed: boolean;
  rejectionReason?: string | null;
  uploadedAt?: string;
};

export type OnboardingDocumentSlot = {
  slot: OnboardingDocumentSlotCode;
  category: string;
  name: string;
  description: string;
  required: boolean;
  document: StoredOnboardingDocument | null;
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function resolveOnboardingMime(file: File): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return file.type || "application/octet-stream";
}

export function isOnboardingDocumentReady(doc: DocumentItem): boolean {
  return (
    Boolean(doc.storageDocumentId) &&
    doc.status !== "empty" &&
    doc.status !== "uploading" &&
    doc.status !== "rejected"
  );
}

export function onboardingApiError(error: unknown, fallback: string): string {
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

function mapServerStatus(status: string): DocumentStatus {
  if (status === "VERIFIED") return "verified";
  if (status === "REJECTED") return "rejected";
  if (status === "UNDER_REVIEW" || status === "UPLOADED")
    return "pending_review";
  return "uploaded";
}

export function applyStoredDocument(
  document: StoredOnboardingDocument,
): Partial<DocumentItem> {
  const fileSize = Number(document.fileSizeBytes ?? 0);
  return {
    status: document.r2Confirmed ? mapServerStatus(document.status) : "empty",
    storageDocumentId: document.r2Confirmed ? document.id : undefined,
    fileName: document.fileName,
    fileSize: Number.isFinite(fileSize) && fileSize > 0 ? fileSize : undefined,
    uploadedAt: document.uploadedAt,
    uploadProgress: document.r2Confirmed ? 100 : undefined,
    errorMessage: document.rejectionReason ?? undefined,
    previewUrl: undefined,
  };
}

export const emptyOnboardingDocumentPatch = (): Partial<DocumentItem> => ({
  status: "empty",
  storageDocumentId: undefined,
  fileName: undefined,
  fileSize: undefined,
  uploadProgress: undefined,
  uploadedAt: undefined,
  errorMessage: undefined,
  previewUrl: undefined,
});

export async function listOnboardingDocuments(): Promise<
  OnboardingDocumentSlot[]
> {
  const response = await apiClient.get<
    Envelope<{ slots: OnboardingDocumentSlot[] }>
  >("/seller/onboarding/documents");
  return response.data.data?.slots ?? [];
}

export async function createOnboardingDocumentUpload(input: {
  slot: OnboardingDocumentSlotCode;
  file: File;
}): Promise<{ id: string; uploadUrl: string; mimeType: string }> {
  const mimeType = resolveOnboardingMime(input.file);
  const response = await apiClient.post<
    Envelope<{
      id: string;
      uploadUrl?: string | null;
      mimeType?: string | null;
    }>
  >("/seller/onboarding/documents", {
    slot: input.slot,
    fileName: input.file.name,
    mimeType,
    fileSizeBytes: input.file.size,
    source: "SELLER_WEB",
  });
  const data = response.data.data;
  if (!data?.id || !data.uploadUrl) {
    throw new Error("Storage upload URL was not issued");
  }
  return { id: data.id, uploadUrl: data.uploadUrl, mimeType };
}

export function putFileToSignedUrl(
  url: string,
  file: File,
  mimeType: string,
  onProgress: (percent: number) => void,
): { promise: Promise<void>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<void>((resolve, reject) => {
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("STORAGE_UPLOAD_FAILED"));
    };
    xhr.onerror = () => reject(new Error("STORAGE_UPLOAD_FAILED"));
    xhr.onabort = () => reject(new Error("UPLOAD_CANCELLED"));
    xhr.send(file);
  });
  return {
    promise,
    abort: () => xhr.abort(),
  };
}

export async function confirmOnboardingDocument(
  documentId: string,
): Promise<StoredOnboardingDocument> {
  const response = await apiClient.post<Envelope<StoredOnboardingDocument>>(
    `/seller/onboarding/documents/${documentId}/confirm`,
  );
  return response.data.data;
}

export async function deleteOnboardingDocument(
  documentId: string,
): Promise<void> {
  await apiClient.delete(`/seller/onboarding/documents/${documentId}`);
}

export async function downloadOnboardingDocument(
  documentId: string,
): Promise<{ url: string; fileName?: string }> {
  const response = await apiClient.get<
    Envelope<{ url: string; fileName?: string }>
  >(`/seller/onboarding/documents/${documentId}/download`);
  return response.data.data;
}
