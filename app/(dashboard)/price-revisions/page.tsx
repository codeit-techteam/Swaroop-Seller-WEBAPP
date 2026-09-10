import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { SellerPriceRevisionView } from "@/modules/seller-price-revisions";
import { PriceRevisionSkeleton } from "@/modules/seller-price-revisions/skeleton";

export const metadata = createRouteMetadata(
  "Price Revision",
  "Review and respond to price revision requests from buyers",
);

export default function PriceRevisionsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
          <PriceRevisionSkeleton />
        </div>
      }
    >
      <SellerPriceRevisionView />
    </Suspense>
  );
}
