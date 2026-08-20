import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { toPublishedProduct } from "@/lib/cx";
import {
  catalogCategoriesMock,
  catalogProductsMock,
  marketplaceOffersMock,
} from "@/mock/marketplace-cms";
import { catalogService } from "@/services/catalogService";
import { cmsService } from "@/services/cmsService";
import { auditService } from "@/services/cxOpsService";
import type {
  CatalogCategory,
  CatalogProduct,
  MarketplaceOffer,
  PublishedMarketplaceSnapshot,
  PublishStatus,
} from "@/types/marketplace-cms";

async function pushPublished(
  products: CatalogProduct[],
  categories: CatalogCategory[],
  offers: MarketplaceOffer[],
) {
  const homepage = await cmsService.getHomepage();
  const banners = (await cmsService.listBanners()).filter(
    (row) => row.status === "LIVE",
  );
  const media = await cmsService.listMedia();
  const snapshot: PublishedMarketplaceSnapshot = {
    publishedAt: new Date().toISOString(),
    products: products
      .filter((product) => product.publishStatus === "LIVE" && product.active)
      .map(toPublishedProduct),
    categories: categories.filter((category) => category.active),
    banners,
    offers: offers.filter((offer) => offer.status === "ACTIVE"),
    homepage,
    media,
  };
  if (typeof window !== "undefined") {
    await fetch("/api/cx/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    }).catch(() => undefined);
  }
}

interface MarketplaceCmsState {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  offers: MarketplaceOffer[];
  upsertProduct: (
    input: Partial<CatalogProduct> & { name: string; grade: string },
  ) => Promise<CatalogProduct>;
  setProductStatus: (
    id: string,
    status: PublishStatus,
    active?: boolean,
  ) => Promise<void>;
  upsertCategory: (
    input: Partial<CatalogCategory> & { name: string },
  ) => Promise<void>;
  setCategoryActive: (id: string, active: boolean) => Promise<void>;
  reorderCategories: (ids: string[]) => Promise<void>;
  upsertOffer: (
    input: Partial<MarketplaceOffer> & { name: string },
  ) => Promise<void>;
  publishLive: () => Promise<void>;
}

export const useMarketplaceCmsStore = create<MarketplaceCmsState>()(
  devtools(
    (set, get) => ({
      products: catalogProductsMock,
      categories: catalogCategoriesMock,
      offers: marketplaceOffersMock,
      upsertProduct: async (input) => {
        const previous = input.id
          ? get().products.find((row) => row.id === input.id)
          : undefined;
        const saved = await catalogService.upsertProduct(input);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: previous ? "PRODUCT_UPDATE" : "PRODUCT_CREATE",
          entity: "Product",
          entityId: saved.id,
          oldValue: previous ? String(previous.sellingPrice) : undefined,
          newValue: String(saved.sellingPrice),
        });
        const products = await catalogService.listProducts();
        set({ products });
        if (saved.publishStatus === "LIVE") {
          await pushPublished(products, get().categories, get().offers);
        }
        return saved;
      },
      setProductStatus: async (id, status, active) => {
        const previous = get().products.find((row) => row.id === id);
        await catalogService.setProductStatus(id, status, active);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "PRODUCT_PUBLISH",
          entity: "Product",
          entityId: id,
          oldValue: previous?.publishStatus,
          newValue: status,
        });
        const products = await catalogService.listProducts();
        set({ products });
        await pushPublished(products, get().categories, get().offers);
      },
      upsertCategory: async (input) => {
        await catalogService.upsertCategory(input);
        const categories = await catalogService.listCategories();
        set({ categories });
        await pushPublished(get().products, categories, get().offers);
      },
      setCategoryActive: async (id, active) => {
        await catalogService.setCategoryActive(id, active);
        const categories = await catalogService.listCategories();
        set({ categories });
        await pushPublished(get().products, categories, get().offers);
      },
      reorderCategories: async (ids) => {
        await catalogService.reorderCategories(ids);
        set({ categories: await catalogService.listCategories() });
      },
      upsertOffer: async (input) => {
        const saved = await catalogService.upsertOffer(input);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "OFFER_CHANGE",
          entity: "Offer",
          entityId: saved.id,
          newValue: saved.status,
        });
        const offers = await catalogService.listOffers();
        set({ offers });
        await pushPublished(get().products, get().categories, offers);
      },
      publishLive: async () => {
        await pushPublished(get().products, get().categories, get().offers);
      },
    }),
    { name: "marketplace-cms-store" },
  ),
);
