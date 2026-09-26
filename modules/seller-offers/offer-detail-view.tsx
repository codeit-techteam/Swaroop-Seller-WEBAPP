"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatMt, formatPricePerKg } from "@/lib/seller/format";
import { useSellerOfferStore } from "@/store/sellerOfferStore";

export function OfferDetailView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const offer = useSellerOfferStore((s) => s.getById(params.id));
  const hydrate = useSellerOfferStore((s) => s.hydrate);
  const loading = useSellerOfferStore((s) => s.loading);
  const setOfferStatus = useSellerOfferStore((s) => s.setOfferStatus);

  useEffect(() => {
    if (!offer) {
      void hydrate();
    }
  }, [offer, hydrate]);

  if (loading && !offer) {
    return (
      <PageContainer>
        <PageHeader title="Loading offer…" />
      </PageContainer>
    );
  }

  if (!offer) {
    return (
      <PageContainer>
        <PageHeader title="Offer not found" />
        <Button onClick={() => router.push(ROUTES.OFFERS)}>Back</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={offer.gradeName}
        description={offer.category}
        actions={<SellerStatusBadge status={offer.status} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Info label="Price" value={formatPricePerKg(offer.price)} />
        <Info label="Available" value={formatMt(offer.availableQty)} />
        <Info label="MOQ" value={formatMt(offer.moq)} />
        <Info label="GST" value={`${offer.gstPercent}%`} />
        <Info label="Payment" value={offer.paymentTerms} />
        <Info label="Delivery" value={offer.deliveryLocation} />
      </div>
      {offer.bulkPricing.length > 0 ? (
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Bulk pricing</h2>
          {offer.bulkPricing.map((slab) => (
            <p key={slab.id} className="text-sm">
              {slab.minQty}–{slab.maxQty ?? "∞"} MT ·{" "}
              {formatPricePerKg(slab.price)}
            </p>
          ))}
        </section>
      ) : null}
      {offer.remarks ? (
        <p className="text-sm text-slate-600">Remark: {offer.remarks}</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            void setOfferStatus(
              offer.id,
              offer.status === "active" ? "paused" : "active",
            )
              .then(() => toast.success("Offer updated"))
              .catch((error: unknown) =>
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to update offer",
                ),
              );
          }}
        >
          {offer.status === "active" ? "Pause" : "Activate"}
        </Button>
        <Button variant="outline" onClick={() => router.push(ROUTES.OFFERS)}>
          Back to offers
        </Button>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
