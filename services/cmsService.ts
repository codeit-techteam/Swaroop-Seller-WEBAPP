import { nextId, nowIso } from "@/lib/cx";
import {
  cmsBannersMock,
  cmsMediaMock,
  homepageCmsMock,
} from "@/mock/marketplace-cms";
import type {
  CmsBanner,
  CmsMediaAsset,
  CmsSection,
  HomepageCms,
  PublishStatus,
} from "@/types/marketplace-cms";

let banners = [...cmsBannersMock];
let media = [...cmsMediaMock];
let homepage: HomepageCms = {
  ...homepageCmsMock,
  sections: homepageCmsMock.sections.map((section) => ({ ...section })),
};

export const cmsService = {
  async getHomepage() {
    return homepage;
  },
  async setSectionEnabled(id: string, enabled: boolean) {
    homepage = {
      ...homepage,
      updatedAt: nowIso(),
      sections: homepage.sections.map((section) =>
        section.id === id ? { ...section, enabled } : section,
      ),
    };
    return homepage;
  },
  async reorderSections(ids: string[]) {
    homepage = {
      ...homepage,
      updatedAt: nowIso(),
      sections: ids
        .map((id, index) => {
          const section = homepage.sections.find((row) => row.id === id);
          return section ? { ...section, displayOrder: index + 1 } : null;
        })
        .filter((row): row is CmsSection => Boolean(row)),
    };
    return homepage;
  },
  async setHomepageStatus(status: PublishStatus) {
    homepage = { ...homepage, status, updatedAt: nowIso() };
    return homepage;
  },
  async updateSection(id: string, patch: Partial<CmsSection>) {
    homepage = {
      ...homepage,
      updatedAt: nowIso(),
      sections: homepage.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    };
    return homepage;
  },
  async listBanners() {
    return banners;
  },
  async upsertBanner(input: Partial<CmsBanner> & { title: string }) {
    const existing = input.id
      ? banners.find((row) => row.id === input.id)
      : undefined;
    const next: CmsBanner = {
      id: existing?.id ?? nextId("ban"),
      title: input.title,
      subtitle: input.subtitle ?? existing?.subtitle ?? "",
      imageUrl: input.imageUrl ?? existing?.imageUrl ?? "",
      mobileImageUrl:
        input.mobileImageUrl ??
        input.imageUrl ??
        existing?.mobileImageUrl ??
        "",
      desktopImageUrl:
        input.desktopImageUrl ??
        input.imageUrl ??
        existing?.desktopImageUrl ??
        "",
      ctaText: input.ctaText ?? existing?.ctaText ?? "Shop Now",
      ctaAction: input.ctaAction ?? existing?.ctaAction ?? "SHOP_NOW",
      targetProductId: input.targetProductId ?? existing?.targetProductId,
      targetCategoryId: input.targetCategoryId ?? existing?.targetCategoryId,
      targetOfferId: input.targetOfferId ?? existing?.targetOfferId,
      startDate:
        input.startDate ?? existing?.startDate ?? nowIso().slice(0, 10),
      endDate: input.endDate ?? existing?.endDate ?? nowIso().slice(0, 10),
      status: input.status ?? existing?.status ?? "DRAFT",
      displayOrder:
        input.displayOrder ?? existing?.displayOrder ?? banners.length + 1,
    };
    banners = existing
      ? banners.map((row) => (row.id === existing.id ? next : row))
      : [next, ...banners];
    return next;
  },
  async listMedia() {
    return media;
  },
  async addMedia(input: Omit<CmsMediaAsset, "id" | "createdAt">) {
    const next: CmsMediaAsset = {
      ...input,
      id: nextId("media"),
      createdAt: nowIso(),
    };
    media = [next, ...media];
    return next;
  },
};
