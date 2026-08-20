import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  cmsBannersMock,
  cmsMediaMock,
  homepageCmsMock,
} from "@/mock/marketplace-cms";
import { cmsService } from "@/services/cmsService";
import { auditService } from "@/services/cxOpsService";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type {
  CmsBanner,
  CmsMediaAsset,
  CmsPreviewDevice,
  CmsSection,
  HomepageCms,
  PublishStatus,
} from "@/types/marketplace-cms";

interface CmsState {
  homepage: HomepageCms;
  banners: CmsBanner[];
  media: CmsMediaAsset[];
  previewDevice: CmsPreviewDevice;
  previewScreen:
    | "home"
    | "marketplace"
    | "product"
    | "offers"
    | "checkout"
    | "pr"
    | "profile";
  setPreviewDevice: (device: CmsPreviewDevice) => void;
  setPreviewScreen: (screen: CmsState["previewScreen"]) => void;
  setSectionEnabled: (id: string, enabled: boolean) => Promise<void>;
  reorderSections: (ids: string[]) => Promise<void>;
  updateSection: (id: string, patch: Partial<CmsSection>) => Promise<void>;
  setHomepageStatus: (status: PublishStatus) => Promise<void>;
  upsertBanner: (
    input: Partial<CmsBanner> & { title: string },
  ) => Promise<void>;
  addMedia: (input: Omit<CmsMediaAsset, "id" | "createdAt">) => Promise<void>;
}

export const useCmsStore = create<CmsState>()(
  devtools(
    (set) => ({
      homepage: homepageCmsMock,
      banners: cmsBannersMock,
      media: cmsMediaMock,
      previewDevice: "DESKTOP",
      previewScreen: "home",
      setPreviewDevice: (device) => set({ previewDevice: device }),
      setPreviewScreen: (screen) => set({ previewScreen: screen }),
      setSectionEnabled: async (id, enabled) => {
        set({ homepage: await cmsService.setSectionEnabled(id, enabled) });
      },
      reorderSections: async (ids) => {
        set({ homepage: await cmsService.reorderSections(ids) });
      },
      updateSection: async (id, patch) => {
        set({ homepage: await cmsService.updateSection(id, patch) });
      },
      setHomepageStatus: async (status) => {
        const homepage = await cmsService.setHomepageStatus(status);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: status === "LIVE" ? "CMS_PUBLISH" : "CMS_STATUS",
          entity: "Homepage",
          entityId: homepage.id,
          newValue: status,
        });
        set({ homepage });
        if (status === "LIVE") {
          await useMarketplaceCmsStore.getState().publishLive();
        }
      },
      upsertBanner: async (input) => {
        await cmsService.upsertBanner(input);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "BANNER_CHANGE",
          entity: "Banner",
          entityId: input.id ?? "new",
          newValue: input.status ?? input.title,
        });
        set({ banners: await cmsService.listBanners() });
        await useMarketplaceCmsStore.getState().publishLive();
      },
      addMedia: async (input) => {
        await cmsService.addMedia(input);
        set({ media: await cmsService.listMedia() });
      },
    }),
    { name: "cms-store" },
  ),
);
