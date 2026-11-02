import { apiClient } from "@/services/apiClient";

type Envelope<T> = {
  success: boolean;
  data: T;
};

export type SellerGradeTdsItem = {
  id: string;
  type: string;
  title: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  manufacturer?: string | null;
  gradeCode?: string | null;
  categoryCode?: string | null;
  revision?: number;
  verificationStatus?: string;
  format?: "pdf" | "image" | "other" | string;
  available?: boolean;
  source?: "GRADE_LIBRARY" | string;
};

export type SellerGradeTdsResponse = {
  grade: {
    id: string;
    code: string;
    name: string;
    gradeNo?: string | null;
    manufacturer?: string | null;
  };
  product?: {
    id: string;
    code?: string | null;
    name: string;
    manufacturer?: string | null;
  } | null;
  available: boolean;
  message?: string | null;
  items: SellerGradeTdsItem[];
};

/** Verified platform grade-library TDS for a seller product (read-only). */
export async function fetchSellerProductGradeTds(
  productId: string,
): Promise<SellerGradeTdsResponse> {
  const response = await apiClient.get<Envelope<SellerGradeTdsResponse>>(
    `/seller/products/${productId}/documents/grade-tds`,
  );
  return (
    response.data.data ?? {
      grade: { id: "", code: "", name: "" },
      available: false,
      items: [],
    }
  );
}
