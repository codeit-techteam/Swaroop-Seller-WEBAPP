import { apiClient } from "@/services/apiClient";

type Envelope<T> = {
  success: boolean;
  data: T;
};

export type ProductDocumentType =
  | "TDS"
  | "MDS"
  | "MSDS"
  | "SDS"
  | "COA"
  | "TECHNICAL_SPECIFICATION"
  | "PRODUCT_SPECIFICATION"
  | "QUALITY_CERTIFICATE"
  | "TEST_CERTIFICATE"
  | "COMPLIANCE_CERTIFICATE"
  | "OTHER";

export type SellerProductDocument = {
  id: string;
  documentType: ProductDocumentType | string;
  title: string;
  description?: string | null;
  originalFileName?: string;
  fileName?: string;
  mimeType?: string | null;
  fileSizeBytes?: string | null;
  version: number;
  status: string;
  statusLabel?: string;
  uploadUrl?: string | null;
  uploadedAt?: string;
};

export const PRODUCT_DOCUMENT_TYPE_OPTIONS: Array<{
  value: ProductDocumentType;
  label: string;
}> = [
  { value: "TDS", label: "TDS — Technical Data Sheet" },
  { value: "MDS", label: "MDS — Material Data Sheet" },
  { value: "MSDS", label: "MSDS — Material Safety Data Sheet" },
  { value: "SDS", label: "SDS — Safety Data Sheet" },
  { value: "COA", label: "COA — Certificate of Analysis" },
  { value: "TECHNICAL_SPECIFICATION", label: "Technical Specification" },
  { value: "PRODUCT_SPECIFICATION", label: "Product Specification" },
  { value: "QUALITY_CERTIFICATE", label: "Quality Certificate" },
  { value: "TEST_CERTIFICATE", label: "Test Certificate" },
  { value: "COMPLIANCE_CERTIFICATE", label: "Compliance Certificate" },
  { value: "OTHER", label: "Other" },
];

export async function listProductDocuments(
  productId: string,
): Promise<SellerProductDocument[]> {
  const response = await apiClient.get<Envelope<SellerProductDocument[]>>(
    `/seller/products/${productId}/documents`,
  );
  return response.data.data ?? [];
}

export async function uploadProductDocument(
  productId: string,
  input: {
    documentType: ProductDocumentType;
    title?: string;
    description?: string;
    file: File;
  },
): Promise<SellerProductDocument> {
  const response = await apiClient.post<
    Envelope<SellerProductDocument & { uploadUrl?: string | null }>
  >(`/seller/products/${productId}/documents`, {
    documentType: input.documentType,
    title: input.title,
    description: input.description,
    fileName: input.file.name,
    mimeType: input.file.type || "application/pdf",
    fileSizeBytes: input.file.size,
  });

  const doc = response.data.data;
  if (doc?.uploadUrl) {
    const put = await fetch(doc.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": input.file.type || "application/pdf",
      },
      body: input.file,
    });
    if (!put.ok) {
      throw new Error("STORAGE_UPLOAD_FAILED");
    }
  }

  return doc;
}

export async function replaceProductDocument(
  productId: string,
  documentId: string,
  file: File,
  title?: string,
): Promise<SellerProductDocument> {
  const response = await apiClient.post<
    Envelope<SellerProductDocument & { uploadUrl?: string | null }>
  >(`/seller/products/${productId}/documents/${documentId}/replace`, {
    fileName: file.name,
    mimeType: file.type || "application/pdf",
    fileSizeBytes: file.size,
    title,
  });
  const doc = response.data.data;
  if (doc?.uploadUrl) {
    const put = await fetch(doc.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/pdf" },
      body: file,
    });
    if (!put.ok) throw new Error("STORAGE_UPLOAD_FAILED");
  }
  return doc;
}

export async function archiveProductDocument(
  productId: string,
  documentId: string,
): Promise<void> {
  await apiClient.delete(`/seller/products/${productId}/documents/${documentId}`);
}

export async function downloadProductDocument(
  productId: string,
  documentId: string,
): Promise<{ url: string; fileName?: string }> {
  const response = await apiClient.get<
    Envelope<{ url: string; fileName?: string }>
  >(`/seller/products/${productId}/documents/${documentId}/download`);
  return response.data.data;
}
