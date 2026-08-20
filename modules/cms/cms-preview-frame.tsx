"use client";

import { formatCompactInr } from "@/lib/utils";
import { useCmsStore } from "@/store/cmsStore";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import { CMS_SECTION_LABELS } from "@/types/marketplace-cms";

export function CmsPreviewFrame() {
  const device = useCmsStore((s) => s.previewDevice);
  const homepage = useCmsStore((s) => s.homepage);
  const banners = useCmsStore((s) => s.banners);
  const products = useMarketplaceCmsStore((s) => s.products);
  const categories = useMarketplaceCmsStore((s) => s.categories);
  const offers = useMarketplaceCmsStore((s) => s.offers);
  const liveProducts = products.filter((row) => row.publishStatus === "LIVE");
  const liveBanners = banners.filter((row) => row.status === "LIVE");
  const liveOffers = offers.filter((row) => row.status === "ACTIVE");
  const sections = [...homepage.sections]
    .filter((section) => section.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div
      className={
        device === "MOBILE"
          ? "mx-auto w-[320px] overflow-hidden rounded-[28px] border-8 border-slate-900 bg-white shadow-xl"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      }
    >
      <div className="bg-[#0B1F3A] px-4 py-3 text-white">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
          PetroTrade
        </p>
        <p className="text-sm font-semibold">
          Customer {device === "MOBILE" ? "APP" : "WEB"}
        </p>
      </div>
      <div className="max-h-[640px] space-y-3 overflow-y-auto p-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {CMS_SECTION_LABELS[section.type]}
            </p>
            {section.type === "HERO_BANNER" ||
            section.type === "PROMO_BANNER" ? (
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {liveBanners[section.type === "HERO_BANNER" ? 0 : 1]?.title ??
                  "No live banner"}
              </p>
            ) : null}
            {section.type === "CATEGORIES" ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {categories
                  .filter((row) => row.active)
                  .slice(0, 6)
                  .map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {category.name}
                    </span>
                  ))}
              </div>
            ) : null}
            {section.type === "FEATURED_PRODUCTS" ? (
              <div className="mt-2 space-y-1">
                {liveProducts.slice(0, 3).map((product) => (
                  <p key={product.id} className="text-xs text-slate-700">
                    {product.name} · {formatCompactInr(product.sellingPrice)}/
                    {product.unit}
                  </p>
                ))}
              </div>
            ) : null}
            {section.type === "ACTIVE_OFFERS" ? (
              <p className="mt-1 text-xs text-slate-600">
                {liveOffers[0]?.name ?? "No active offers"}
              </p>
            ) : null}
            {section.type === "MARKET_INSIGHTS" ||
            section.type === "TRUST" ||
            section.type === "BULK_ORDER_CTA" ? (
              <p className="mt-1 text-xs text-slate-600">
                {section.config.insight ||
                  section.config.copy ||
                  section.config.cta}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
