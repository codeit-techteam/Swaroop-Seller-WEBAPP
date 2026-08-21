import type {
  CatalogProduct,
  PublishedMarketplaceSnapshot,
  PublishedProduct,
} from "@/types/marketplace-cms";

export function stockIndicator(
  qty: number,
): PublishedProduct["stockIndicator"] {
  if (qty <= 0) return "out_of_stock";
  if (qty < 150) return "limited";
  return "in_stock";
}

export function toPublishedProduct(product: CatalogProduct): PublishedProduct {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    grade: product.grade,
    material: product.material,
    brand: product.brand,
    categoryId: product.categoryId,
    description: product.description,
    images: product.images,
    videoUrl: product.videoUrl,
    packaging: product.packaging,
    unit: product.unit,
    moq: product.moq,
    availableQty: product.availableQty,
    stockIndicator: stockIndicator(product.availableQty),
    location: product.location,
    origin: product.origin || product.location,
    casNumber: product.casNumber,
    hsnCode: product.hsnCode,
    application: product.application,
    applications: product.applications,
    industry: product.industry,
    creditEligible: product.creditEligible,
    highlights: product.highlights,
    qualityBadges: product.qualityBadges,
    deliveryAvailable: product.deliveryAvailable,
    specifications: product.specifications,
    sellingPrice: product.sellingPrice,
    marketPrice: product.marketPrice,
    deliveryCharge: product.deliveryCharge,
    transportMode: product.transportMode,
    bulkPrices: product.bulkPrices,
    paymentTerms: product.paymentTerms.filter((term) => term.enabled),
    documents: product.documents,
    etaLabel: product.etaLabel || (product.deliveryAvailable ? "2–5 Days" : "On request"),
  };
}

export function marginOf(product: CatalogProduct) {
  const margin = product.sellingPrice - product.internalCost;
  const pct = product.sellingPrice ? (margin / product.sellingPrice) * 100 : 0;
  return { margin, pct };
}

export function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function isLiveStatus(status: string) {
  return status === "LIVE" || status === "ACTIVE";
}

export function emptySnapshot(): PublishedMarketplaceSnapshot {
  return {
    publishedAt: nowIso(),
    products: [],
    categories: [],
    banners: [],
    offers: [],
    homepage: {
      id: "home-customer",
      status: "DRAFT",
      updatedAt: nowIso(),
      sections: [],
    },
    media: [],
  };
}
