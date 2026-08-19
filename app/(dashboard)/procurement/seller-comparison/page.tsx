import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { SellerComparisonView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Seller Comparison",
  "Compare supplier quotations for a purchase request",
);

export default function SellerComparisonPage() {
  return (
    <Suspense>
      <SellerComparisonView />
    </Suspense>
  );
}
