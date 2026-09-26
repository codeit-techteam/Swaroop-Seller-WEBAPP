import { apiClient } from "@/services/apiClient";
import type { BulkPriceSlab, SellerProduct } from "@/types/seller";

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

type BackendPriceTier = {
  id?: string;
  minQty?: number | string;
  maxQty?: number | string | null;
  price?: number | string;
};

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
  countryOfOrigin?: string | null;
  technicalSpecs?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  offerId?: string;
  inventoryId?: string;
  published?: boolean;
  grade?: {
    id: string;
    code: string;
    name: string;
    category?: { name?: string; code?: string } | null;
  };
  inventory?: Array<{
    id?: string;
    availableQty?: number | string;
    reservedQty?: number | string;
    allocatedQty?: number | string;
    minStockQty?: number | string | null;
    warehouse?: { id?: string; name?: string; city?: string } | null;
  }>;
  offers?: Array<{
    id?: string;
    basePrice?: number | string;
    moq?: number | string;
    quantity?: number | string;
    status?: string;
    deliveryTerms?: string | null;
    inventoryId?: string | null;
    priceTiers?: BackendPriceTier[];
  }>;
};

function mapStatus(status?: string): SellerProduct["offerStatus"] {
  if (status === "ACTIVE") return "active";
  if (status === "DRAFT" || status === "PENDING_REVIEW") return "draft";
  if (status === "PAUSED") return "paused";
  return "none";
}

function mapProduct(item: BackendSellerProduct): SellerProduct {
  const offer = item.offers?.[0];
  const inventory = item.inventory?.[0];
  const specs = (item.technicalSpecs ?? {}) as Record<string, unknown>;
  const tiers: BulkPriceSlab[] = (offer?.priceTiers ?? []).map((t, index) => ({
    id: t.id ?? `tier-${index}`,
    minQty: Number(t.minQty ?? 0),
    maxQty: t.maxQty == null || t.maxQty === "" ? null : Number(t.maxQty),
    price: Number(t.price ?? 0),
  }));

  return {
    id: item.id,
    category: item.grade?.category?.name ?? item.grade?.name ?? "Grade",
    gradeName: item.name,
    manufacturer: item.manufacturer ?? item.brand ?? "PRIVATE",
    gradeCode: item.code,
    polymerType:
      (typeof specs.polymerType === "string" && specs.polymerType) ||
      item.grade?.category?.code ||
      item.grade?.code ||
      "",
    application:
      (typeof specs.application === "string" && specs.application) ||
      (Array.isArray(specs.applications)
        ? String(specs.applications[0] ?? "")
        : "") ||
      item.grade?.name ||
      "",
    mfi: item.mfi ?? "",
    density: item.density ?? "",
    packagingType: item.packaging ?? "25 kg bags",
    unit: item.unit === "kg" ? "kg" : "MT",
    availableStock: Number(inventory?.availableQty ?? offer?.quantity ?? 0),
    reservedStock: Number(inventory?.reservedQty ?? 0),
    committedStock: Number(inventory?.allocatedQty ?? 0),
    locationId: inventory?.warehouse?.id ?? "loc-default",
    moq: Number(offer?.moq ?? 0),
    origin: item.countryOfOrigin ?? "India",
    warehouse:
      inventory?.warehouse?.name ||
      (typeof specs.warehouseLabel === "string" ? specs.warehouseLabel : "") ||
      "",
    notes: typeof item.metadata?.notes === "string" ? item.metadata.notes : "",
    offerStatus: mapStatus(offer?.status ?? item.status),
    basePrice: Number(offer?.basePrice ?? 0),
    currency: "INR",
    gstPercent: Number(item.metadata?.gstPercent ?? 18),
    bulkPricing: tiers,
    inventoryId: inventory?.id ?? offer?.inventoryId ?? undefined,
    offerId: offer?.id ?? item.offerId,
    gradeId: item.grade?.id,
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    createdAt: item.createdAt ?? new Date().toISOString(),
  } satisfies SellerProduct;
}

export async function fetchSellerProducts(): Promise<SellerProduct[]> {
  const response = await apiClient.get<Envelope<BackendSellerProduct[]>>(
    `/seller/products`,
    { params: { page: 1, limit: 100 } },
  );
  return (response.data.data ?? []).map(mapProduct);
}

export async function fetchSellerProduct(id: string): Promise<SellerProduct> {
  const response = await apiClient.get<Envelope<BackendSellerProduct>>(
    `/seller/products/${id}`,
  );
  return mapProduct(response.data.data);
}

export type CreateMarketplaceListingInput = {
  gradeId: string;
  name: string;
  code: string;
  manufacturer?: string;
  brand?: string;
  mfi?: string;
  density?: string;
  packaging?: string;
  unit?: string;
  countryOfOrigin?: string;
  supplyOrigin?: string;
  application?: string;
  polymerType?: string;
  warehouseName?: string;
  availableStock: number;
  reservedStock?: number;
  moq: number;
  sellingPrice: number;
  priceTiers?: Array<{
    minQty: number;
    maxQty?: number | null;
    price: number;
    label?: string;
  }>;
  notes?: string;
  publishToMarketplace?: boolean;
  gstPercent?: number;
};

function listingBody(input: CreateMarketplaceListingInput) {
  return {
    gradeId: input.gradeId,
    code: input.code,
    name: input.name,
    manufacturer: input.manufacturer,
    brand: input.brand ?? input.manufacturer,
    mfi: input.mfi,
    density: input.density,
    packaging: input.packaging,
    unit: input.unit ?? "MT",
    countryOfOrigin: input.countryOfOrigin,
    supplyOrigin: input.supplyOrigin ?? input.countryOfOrigin,
    application: input.application,
    polymerType: input.polymerType,
    warehouseName: input.warehouseName,
    availableStock: input.availableStock,
    reservedStock: input.reservedStock ?? 0,
    moq: input.moq,
    sellingPrice: input.sellingPrice,
    priceTiers: input.priceTiers,
    notes: input.notes,
    publishToMarketplace: input.publishToMarketplace ?? true,
    technicalSpecs: {
      ...(input.application ? { application: input.application } : {}),
      ...(input.polymerType ? { polymerType: input.polymerType } : {}),
      ...(input.application ? { applications: [input.application] } : {}),
    },
    metadata: {
      gstPercent: input.gstPercent ?? 18,
    },
  };
}

export async function createSellerListing(
  input: CreateMarketplaceListingInput,
) {
  const response = await apiClient.post<Envelope<BackendSellerProduct>>(
    `/seller/products/listings`,
    listingBody(input),
  );
  return mapProduct(response.data.data);
}

export async function updateSellerListing(
  id: string,
  input: CreateMarketplaceListingInput,
) {
  const response = await apiClient.patch<Envelope<BackendSellerProduct>>(
    `/seller/products/listings/${id}`,
    listingBody(input),
  );
  return mapProduct(response.data.data);
}

export async function adjustSellerInventory(input: {
  inventoryId: string;
  quantityDelta: number;
  notes?: string;
}) {
  const response = await apiClient.post(
    `/seller/inventory/${input.inventoryId}/adjust`,
    {
      quantityDelta: input.quantityDelta,
      type: "ADJUSTMENT",
      notes: input.notes ?? "Stock adjustment from seller portal",
    },
  );
  return response.data.data;
}
