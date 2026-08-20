import { toPublishedProduct } from "@/lib/cx";
import {
  catalogCategoriesMock,
  catalogProductsMock,
  cmsBannersMock,
  cmsMediaMock,
  homepageCmsMock,
  marketplaceOffersMock,
} from "@/mock/marketplace-cms";
import type { PublishedMarketplaceSnapshot } from "@/types/marketplace-cms";

function fromMocks(): PublishedMarketplaceSnapshot {
  return {
    publishedAt: homepageCmsMock.updatedAt,
    products: catalogProductsMock
      .filter((product) => product.publishStatus === "LIVE" && product.active)
      .map(toPublishedProduct),
    categories: catalogCategoriesMock.filter((category) => category.active),
    banners: cmsBannersMock.filter((banner) => banner.status === "LIVE"),
    offers: marketplaceOffersMock.filter((offer) => offer.status === "ACTIVE"),
    homepage: homepageCmsMock,
    media: cmsMediaMock,
  };
}

let cache: PublishedMarketplaceSnapshot = fromMocks();

export function getPublishedSnapshot(): PublishedMarketplaceSnapshot {
  return cache;
}

export function setPublishedSnapshot(next: PublishedMarketplaceSnapshot) {
  cache = next;
  return cache;
}

export function resetPublishedSnapshot() {
  cache = fromMocks();
  return cache;
}
