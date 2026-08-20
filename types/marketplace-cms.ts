export type PublishStatus =
  "DRAFT" | "PREVIEW" | "PENDING_APPROVAL" | "LIVE" | "PAUSED" | "ARCHIVED";

export type BannerVisibility =
  "DRAFT" | "SCHEDULED" | "LIVE" | "EXPIRED" | "INACTIVE";

export type OfferLifecycle =
  "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED" | "PAUSED";

export type DiscountType = "PERCENT" | "FLAT" | "TIERED";

export type BannerCtaAction =
  | "SHOP_NOW"
  | "VIEW_PRODUCT"
  | "BULK_ORDER"
  | "EXPLORE_OFFERS"
  | "VIEW_CATEGORY";

export type CmsSectionType =
  | "HERO_BANNER"
  | "PROMO_BANNER"
  | "CATEGORIES"
  | "MARKET_PRICE"
  | "FEATURED_PRODUCTS"
  | "ACTIVE_OFFERS"
  | "BULK_ORDER_CTA"
  | "RECOMMENDED"
  | "MARKET_INSIGHTS"
  | "VIDEOS"
  | "TRUST";

export type CmsPreviewDevice = "DESKTOP" | "MOBILE";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  productIds: string[];
}

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  grade: string;
  material: string;
  brand: string;
  categoryId: string;
  description: string;
  images: string[];
  videoUrl?: string;
  packaging: string;
  unit: string;
  moq: number;
  availableQty: number;
  location: string;
  deliveryAvailable: boolean;
  specifications: ProductSpecRow[];
  sellingPrice: number;
  marketPrice: number;
  internalCost: number;
  deliveryCharge: number;
  locationPrices: Array<{ location: string; price: number }>;
  bulkPrices: Array<{ minQty: number; price: number }>;
  segmentPrices: Array<{ segmentId: string; price: number }>;
  effectiveDate: string;
  publishStatus: PublishStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOffer {
  id: string;
  name: string;
  productId?: string;
  categoryId?: string;
  discountType: DiscountType;
  discountValue: number;
  minQty: number;
  maxQty?: number;
  startDate: string;
  endDate: string;
  segmentId?: string;
  promoCode?: string;
  bannerImage: string;
  terms: string;
  status: OfferLifecycle;
  createdAt: string;
}

export interface CmsBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  desktopImageUrl: string;
  ctaText: string;
  ctaAction: BannerCtaAction;
  targetProductId?: string;
  targetCategoryId?: string;
  targetOfferId?: string;
  startDate: string;
  endDate: string;
  status: BannerVisibility;
  displayOrder: number;
}

export interface CmsMediaAsset {
  id: string;
  name: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  thumbnail?: string;
  usedIn: string;
  createdAt: string;
}

export interface CmsSection {
  id: string;
  type: CmsSectionType;
  title: string;
  enabled: boolean;
  displayOrder: number;
  config: Record<string, string>;
}

export interface HomepageCms {
  id: string;
  status: PublishStatus;
  updatedAt: string;
  sections: CmsSection[];
}

export interface PublishedProduct {
  id: string;
  sku: string;
  name: string;
  grade: string;
  material: string;
  brand: string;
  categoryId: string;
  description: string;
  images: string[];
  videoUrl?: string;
  packaging: string;
  unit: string;
  moq: number;
  availableQty: number;
  stockIndicator: "in_stock" | "limited" | "out_of_stock";
  location: string;
  deliveryAvailable: boolean;
  specifications: ProductSpecRow[];
  sellingPrice: number;
  marketPrice: number;
  deliveryCharge: number;
  etaLabel: string;
}

export interface PublishedMarketplaceSnapshot {
  publishedAt: string;
  products: PublishedProduct[];
  categories: CatalogCategory[];
  banners: CmsBanner[];
  offers: MarketplaceOffer[];
  homepage: HomepageCms;
  media: CmsMediaAsset[];
}

export const CATEGORY_EXAMPLES = [
  "PP",
  "PE",
  "HDPE",
  "LDPE",
  "LLDPE",
  "PVC",
  "PET",
  "Other Petrochemicals",
] as const;

export const BANNER_CTA_LABELS: Record<BannerCtaAction, string> = {
  SHOP_NOW: "Shop Now",
  VIEW_PRODUCT: "View Product",
  BULK_ORDER: "Bulk Order",
  EXPLORE_OFFERS: "Explore Offers",
  VIEW_CATEGORY: "View Category",
};

export const CMS_SECTION_LABELS: Record<CmsSectionType, string> = {
  HERO_BANNER: "Hero Banner",
  PROMO_BANNER: "Promotional Banner",
  CATEGORIES: "Product Categories",
  MARKET_PRICE: "Market Price",
  FEATURED_PRODUCTS: "Featured Products",
  ACTIVE_OFFERS: "Active Offers",
  BULK_ORDER_CTA: "Bulk Order CTA",
  RECOMMENDED: "Recently Viewed / Recommended",
  MARKET_INSIGHTS: "Market Insights",
  VIDEOS: "Videos",
  TRUST: "Trust / Service Information",
};
