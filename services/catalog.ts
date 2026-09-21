import { apiClient } from "@/services/apiClient";
import type { SellerProduct } from "@/types/seller";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { total: number };
};

export type SellerGradeOption = {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  category?: { id: string; code: string; name: string } | null;
};

export async function fetchSellerGrades(): Promise<SellerGradeOption[]> {
  const pages: SellerGradeOption[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await apiClient.get<Envelope<SellerGradeOption[]>>(
      `/master-data/grades/seller`,
      { params: { page, limit: 100, sortBy: "sortOrder", sortOrder: "asc" } },
    );
    const payload = response.data;
    pages.push(...(payload.data ?? []));
    totalPages = Math.ceil((payload.meta?.total ?? pages.length) / 100) || 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

type BackendSellerProduct = {
  id: string;
  code: string;
  name: string;
  brand?: string | null;
  manufacturer?: string | null;
  mfi?: string | null;
  density?: string | null;
  packaging?: string | null;
  unit?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  grade?: { id: string; code: string; name: string; category?: { name?: string } | null };
  inventory?: Array<{ availableQty?: number | string }>;
  offers?: Array<{
    basePrice?: number | string;
    moq?: number | string;
    status?: string;
  }>;
};

function mapStatus(status?: string): SellerProduct["offerStatus"] {
  if (status === "ACTIVE") return "active";
  if (status === "DRAFT" || status === "PENDING_REVIEW") return "draft";
  if (status === "PAUSED") return "paused";
  return "none";
}

export async function fetchSellerProducts(): Promise<SellerProduct[]> {
  const response = await apiClient.get<Envelope<BackendSellerProduct[]>>(
    `/seller/products`,
    { params: { page: 1, limit: 100 } },
  );
  return (response.data.data ?? []).map((item) => {
    const offer = item.offers?.[0];
    const inventory = item.inventory?.[0];
    return {
      id: item.id,
      category: item.grade?.category?.name ?? item.grade?.name ?? "Grade",
      gradeName: item.name,
      manufacturer: item.manufacturer ?? item.brand ?? "PRIVATE",
      gradeCode: item.code,
      polymerType: item.grade?.code ?? "",
      application: item.grade?.name ?? "",
      mfi: item.mfi ?? "",
      density: item.density ?? "",
      packagingType: item.packaging ?? "25 kg bags",
      unit: item.unit === "kg" ? "kg" : "MT",
      availableStock: Number(inventory?.availableQty ?? 0),
      reservedStock: 0,
      committedStock: 0,
      locationId: "loc-default",
      moq: Number(offer?.moq ?? 0),
      notes: "",
      offerStatus: mapStatus(offer?.status ?? item.status),
      basePrice: Number(offer?.basePrice ?? 0),
      currency: "INR",
      updatedAt: item.updatedAt ?? new Date().toISOString(),
      createdAt: item.createdAt ?? new Date().toISOString(),
    } satisfies SellerProduct;
  });
}

export async function createSellerListing(input: {
  gradeId: string;
  name: string;
  code: string;
  mfi?: string;
  density?: string;
  packaging?: string;
}) {
  const response = await apiClient.post<Envelope<BackendSellerProduct>>(
    `/seller/products`,
    {
      gradeId: input.gradeId,
      code: input.code,
      name: input.name,
      mfi: input.mfi,
      density: input.density,
      packaging: input.packaging,
      unit: "MT",
    },
  );
  return response.data.data;
}
