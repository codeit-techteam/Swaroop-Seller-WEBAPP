"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  formatPrice,
  formatQty,
  importLabel,
  listingTitle,
  portLabel,
} from "@/lib/import/format";
import type { ImportListing } from "@/types/import";

import { ImportStatusBadge, ImportValidity, KeyValueGrid } from "./import-ui";

export function ImportListingDetails({
  listing: l,
}: {
  listing: ImportListing;
}) {
  const isBuy = l.side === "BUY";
  const eta = l.shipping.estimatedEta;
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Product</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueGrid
            items={[
              { label: "Product", value: l.product.category?.name },
              {
                label: "Grade",
                value: l.product.grade?.name ?? l.product.customGradeName,
              },
              { label: "Brand", value: l.product.brand?.name },
              { label: "Origin", value: l.product.originCountry?.name },
              {
                label: isBuy ? "Required quantity" : "Available quantity",
                value: formatQty(l.product.quantity, l.product.quantityUnit),
              },
              { label: "Packaging", value: l.product.packaging?.name },
              ...(isBuy && l.buyTerms
                ? [
                    {
                      label: "Acceptable range",
                      value:
                        l.buyTerms.acceptableQuantityMin ||
                        l.buyTerms.acceptableQuantityMax
                          ? `${formatQty(l.buyTerms.acceptableQuantityMin, l.product.quantityUnit)} – ${formatQty(l.buyTerms.acceptableQuantityMax, l.product.quantityUnit)}`
                          : null,
                    },
                    {
                      label: "Required delivery",
                      value: formatDate(l.buyTerms.requiredDeliveryDate),
                    },
                  ]
                : []),
              ...(!isBuy && l.sellTerms
                ? [
                    {
                      label: "MOQ",
                      value: formatQty(l.sellTerms.moq, l.product.quantityUnit),
                    },
                    {
                      label: "Maximum per buyer",
                      value: formatQty(
                        l.sellTerms.maximumQuantity,
                        l.product.quantityUnit,
                      ),
                    },
                    {
                      label: "Stock type",
                      value: importLabel(l.sellTerms.readyStockType),
                    },
                  ]
                : []),
              { label: "Application", value: l.product.application },
              { label: "HS code", value: l.product.hsCode },
              { label: "CAS number", value: l.product.casNumber },
              ...(isBuy && l.buyTerms?.specialRequirements
                ? [
                    {
                      label: "Special requirements",
                      value: l.buyTerms.specialRequirements,
                      wide: true,
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Commercial</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueGrid
            items={[
              {
                label: isBuy ? "Target price" : "Offer price",
                value: formatPrice(
                  l.commercial.price,
                  l.commercial.currencyCode,
                  l.commercial.priceUnit,
                ),
              },
              {
                label: "Price type",
                value: importLabel(l.commercial.priceType),
              },
              {
                label: "Incoterm",
                value: l.commercial.incoterm
                  ? `${l.commercial.incoterm.code} ${l.commercial.priceBasisPort ? portLabel(l.commercial.priceBasisPort) : (l.commercial.priceBasisLocation ?? "")}`
                  : null,
              },
              {
                label: "Payment terms",
                value:
                  l.commercial.paymentTerm?.displayName ??
                  l.commercial.paymentTerm?.name,
              },
              ...(l.commercial.currencyCode === "INR"
                ? [
                    {
                      label: "GST",
                      value: importLabel(l.commercial.gstTreatment),
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{portLabel(l.shipping.pol)}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{portLabel(l.shipping.pod)}</span>
          </div>
          <KeyValueGrid
            items={[
              {
                label: "Shipment window",
                value: l.shipping.esd
                  ? `${formatDate(l.shipping.esd)} – ${formatDate(l.shipping.lsd)}`
                  : null,
              },
              {
                label: "Transit time",
                value:
                  l.shipping.transitMinDays !== null &&
                  l.shipping.transitMaxDays !== null
                    ? `${l.shipping.transitMinDays}–${l.shipping.transitMaxDays} days`
                    : null,
              },
              {
                label: "Estimated arrival",
                value: eta ? (
                  <span>
                    {formatDate(eta.from)} – {formatDate(eta.to)}
                    <span className="block text-xs text-muted-foreground">
                      Estimate from transit days, not a carrier schedule
                    </span>
                  </span>
                ) : null,
              },
              {
                label: "Partial shipment",
                value: importLabel(l.shipping.partialShipment),
              },
              {
                label: "Transshipment",
                value: importLabel(l.shipping.transshipment),
              },
              {
                label: "Shipment type",
                value: [
                  l.shipping.shipmentType
                    ? importLabel(l.shipping.shipmentType)
                    : null,
                  l.shipping.containerSize
                    ? importLabel(l.shipping.containerSize)
                    : null,
                  l.shipping.containerCount
                    ? `× ${l.shipping.containerCount}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" "),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quality & documents</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueGrid
            items={[
              {
                label: "Inspection",
                value: importLabel(l.quality.inspectionType),
              },
              {
                label: isBuy ? "Required documents" : "Documents offered",
                value: l.quality.documentRequirements
                  .map((d) => d.name)
                  .join(", "),
                wide: true,
              },
              {
                label: "Specification",
                value: l.quality.specification,
                wide: true,
              },
              { label: "Remarks", value: l.remarks, wide: true },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ImportListingRow({
  listing: l,
  href,
  fetchedAt,
  showCounterparty,
}: {
  listing: ImportListing;
  href: string;
  fetchedAt: number;
  showCounterparty?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border bg-card px-4 py-3.5 shadow-card transition-colors hover:border-primary/40 hover:bg-slate-50/60"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {l.referenceNumber ?? "Draft"}
            {showCounterparty ? ` · ${l.counterpartyRef}` : ""}
          </p>
          <p className="truncate text-[15px] font-semibold text-foreground">
            {listingTitle(l)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {l.status !== "DRAFT" ? (
            <ImportValidity
              validUntil={l.validity.validUntil}
              secondsRemaining={l.validity.secondsRemaining}
              fetchedAt={fetchedAt}
            />
          ) : null}
          <ImportStatusBadge status={l.status} />
        </div>
      </div>
      <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <span>
          <span className="text-muted-foreground">Qty </span>
          {formatQty(l.product.quantity, l.product.quantityUnit)}
        </span>
        <span>
          <span className="text-muted-foreground">Price </span>
          {formatPrice(
            l.commercial.price,
            l.commercial.currencyCode,
            l.commercial.priceUnit,
          )}
          {l.commercial.incoterm ? ` ${l.commercial.incoterm.code}` : ""}
        </span>
        <span className="truncate">
          <span className="text-muted-foreground">Route </span>
          {l.shipping.pol?.code ?? "—"} → {l.shipping.pod?.code ?? "—"}
        </span>
        <span>
          <span className="text-muted-foreground">Ships </span>
          {l.shipping.esd
            ? `${formatDate(l.shipping.esd)} – ${formatDate(l.shipping.lsd)}`
            : "—"}
        </span>
      </div>
    </Link>
  );
}
