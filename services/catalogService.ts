import { nextId, nowIso } from "@/lib/cx";
import {
  catalogCategoriesMock,
  catalogProductsMock,
  marketplaceOffersMock,
} from "@/mock/marketplace-cms";
import type {
  CatalogCategory,
  CatalogProduct,
  MarketplaceOffer,
  PublishStatus,
} from "@/types/marketplace-cms";

let products = [...catalogProductsMock];
let categories = [...catalogCategoriesMock];
let offers = [...marketplaceOffersMock];

export const catalogService = {
  async listProducts() {
    return products;
  },
  async getProduct(id: string) {
    return products.find((row) => row.id === id);
  },
  async upsertProduct(
    input: Partial<CatalogProduct> & { name: string; grade: string },
  ) {
    const existing = input.id
      ? products.find((row) => row.id === input.id)
      : undefined;
    const next: CatalogProduct = {
      id: existing?.id ?? nextId("prod"),
      sku:
        existing?.sku ??
        `SKU-${input.grade.replace(/\s+/g, "-").toUpperCase()}`,
      name: input.name,
      grade: input.grade,
      material: input.material ?? existing?.material ?? "",
      brand: input.brand ?? existing?.brand ?? "",
      categoryId: input.categoryId ?? existing?.categoryId ?? "cat-other",
      description: input.description ?? existing?.description ?? "",
      images: input.images ?? existing?.images ?? [],
      videoUrl: input.videoUrl ?? existing?.videoUrl,
      packaging: input.packaging ?? existing?.packaging ?? "Jumbo Bags",
      unit: input.unit ?? existing?.unit ?? "MT",
      moq: input.moq ?? existing?.moq ?? 10,
      availableQty: input.availableQty ?? existing?.availableQty ?? 0,
      location: input.location ?? existing?.location ?? "",
      deliveryAvailable:
        input.deliveryAvailable ?? existing?.deliveryAvailable ?? true,
      specifications: input.specifications ?? existing?.specifications ?? [],
      sellingPrice: input.sellingPrice ?? existing?.sellingPrice ?? 0,
      marketPrice: input.marketPrice ?? existing?.marketPrice ?? 0,
      internalCost: input.internalCost ?? existing?.internalCost ?? 0,
      deliveryCharge: input.deliveryCharge ?? existing?.deliveryCharge ?? 0,
      locationPrices: input.locationPrices ?? existing?.locationPrices ?? [],
      bulkPrices: input.bulkPrices ?? existing?.bulkPrices ?? [],
      segmentPrices: input.segmentPrices ?? existing?.segmentPrices ?? [],
      effectiveDate:
        input.effectiveDate ?? existing?.effectiveDate ?? nowIso().slice(0, 10),
      publishStatus: input.publishStatus ?? existing?.publishStatus ?? "DRAFT",
      active: input.active ?? existing?.active ?? false,
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    products = existing
      ? products.map((row) => (row.id === existing.id ? next : row))
      : [next, ...products];
    return next;
  },
  async setProductStatus(
    id: string,
    publishStatus: PublishStatus,
    active?: boolean,
  ) {
    products = products.map((row) =>
      row.id === id
        ? {
            ...row,
            publishStatus,
            active: active ?? publishStatus === "LIVE",
            updatedAt: nowIso(),
          }
        : row,
    );
    return products.find((row) => row.id === id);
  },
  async listCategories() {
    return categories;
  },
  async upsertCategory(input: Partial<CatalogCategory> & { name: string }) {
    const existing = input.id
      ? categories.find((row) => row.id === input.id)
      : undefined;
    const next: CatalogCategory = {
      id: existing?.id ?? nextId("cat"),
      name: input.name,
      slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
      description: input.description ?? existing?.description ?? "",
      imageUrl: input.imageUrl ?? existing?.imageUrl ?? "",
      displayOrder:
        input.displayOrder ?? existing?.displayOrder ?? categories.length + 1,
      active: input.active ?? existing?.active ?? true,
      productIds: input.productIds ?? existing?.productIds ?? [],
    };
    categories = existing
      ? categories.map((row) => (row.id === existing.id ? next : row))
      : [...categories, next];
    return next;
  },
  async setCategoryActive(id: string, active: boolean) {
    categories = categories.map((row) =>
      row.id === id ? { ...row, active } : row,
    );
  },
  async reorderCategories(ids: string[]) {
    categories = ids
      .map((id, index) => {
        const row = categories.find((item) => item.id === id);
        return row ? { ...row, displayOrder: index + 1 } : null;
      })
      .filter((row): row is CatalogCategory => Boolean(row));
  },
  async listOffers() {
    return offers;
  },
  async upsertOffer(input: Partial<MarketplaceOffer> & { name: string }) {
    const existing = input.id
      ? offers.find((row) => row.id === input.id)
      : undefined;
    const next: MarketplaceOffer = {
      id: existing?.id ?? nextId("off"),
      name: input.name,
      productId: input.productId ?? existing?.productId,
      categoryId: input.categoryId ?? existing?.categoryId,
      discountType: input.discountType ?? existing?.discountType ?? "PERCENT",
      discountValue: input.discountValue ?? existing?.discountValue ?? 0,
      minQty: input.minQty ?? existing?.minQty ?? 1,
      maxQty: input.maxQty ?? existing?.maxQty,
      startDate:
        input.startDate ?? existing?.startDate ?? nowIso().slice(0, 10),
      endDate: input.endDate ?? existing?.endDate ?? nowIso().slice(0, 10),
      segmentId: input.segmentId ?? existing?.segmentId,
      promoCode: input.promoCode ?? existing?.promoCode,
      bannerImage: input.bannerImage ?? existing?.bannerImage ?? "",
      terms: input.terms ?? existing?.terms ?? "",
      status: input.status ?? existing?.status ?? "DRAFT",
      createdAt: existing?.createdAt ?? nowIso(),
    };
    offers = existing
      ? offers.map((row) => (row.id === existing.id ? next : row))
      : [next, ...offers];
    return next;
  },
};
