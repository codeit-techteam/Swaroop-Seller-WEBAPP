import { catalogService } from "./catalogService";
import { cmsService } from "./cmsService";
import { customerService } from "./customerService";
import {
  auditService,
  notificationService,
  supportService,
} from "./cxOpsService";

export const offerService = {
  list: () => catalogService.listOffers(),
  upsert: catalogService.upsertOffer,
};

export const categoryService = {
  list: () => catalogService.listCategories(),
  upsert: catalogService.upsertCategory,
  setActive: catalogService.setCategoryActive,
  reorder: catalogService.reorderCategories,
};

export const bannerService = {
  list: () => cmsService.listBanners(),
  upsert: cmsService.upsertBanner,
};

export {
  auditService,
  catalogService,
  cmsService,
  customerService,
  notificationService,
  supportService,
};
