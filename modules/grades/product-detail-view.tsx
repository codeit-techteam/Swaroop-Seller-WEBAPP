"use client";

import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { availableToSell, formatMt } from "@/lib/seller/format";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerProductStore } from "@/store/sellerProductStore";

export function ProductDetailView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const product = useSellerProductStore((s) => s.getById(params.id));
  const offers = useSellerOfferStore((s) =>
    s.offers.filter((offer) => offer.productId === params.id),
  );

  if (!product) {
    return (
      <PageContainer>
        <PageHeader title="Grade not found" />
        <Button onClick={() => router.push(ROUTES.PRODUCTS)}>Back</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={product.gradeName}
        description={`${product.category} · ${product.manufacturer}`}
        actions={
          <Button asChild>
            <a href={ROUTES.OFFERS_NEW}>Create Offer</a>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Category", product.category],
          ["Manufacturer", product.manufacturer],
          ["Grade code", product.gradeCode],
          ["Polymer", product.polymerType],
          ["Application", product.application],
          ["MFI", product.mfi],
          ["Packaging", product.packagingType],
          ["MOQ", formatMt(product.moq)],
          ["Unit", product.unit],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stock label="Available" value={product.availableStock} />
        <Stock label="Reserved" value={product.reservedStock} />
        <Stock label="Committed" value={product.committedStock} />
        <Stock
          label="Available to sell"
          value={availableToSell(
            product.availableStock,
            product.reservedStock,
            product.committedStock,
          )}
        />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Active Offers</h2>
        {offers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No offers yet for this grade.
          </p>
        ) : (
          <div className="space-y-2">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between">
                <span>
                  ₹{offer.price}/kg · {formatMt(offer.availableQty)}
                </span>
                <SellerStatusBadge status={offer.status} />
              </div>
            ))}
          </div>
        )}
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => {
            toast.success("Offer history is shown above");
          }}
        >
          Offer history
        </Button>
      </section>
    </PageContainer>
  );
}

function Stock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{formatMt(value)}</p>
    </div>
  );
}
