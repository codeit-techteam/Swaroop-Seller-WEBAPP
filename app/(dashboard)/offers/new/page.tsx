import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CreateOfferView } from "@/modules/seller-offers/create-offer-view";

export const metadata = createRouteMetadata(
  "Create Offer",
  "Choose a grade, set price and bulk slabs",
);

export default function NewOfferPage() {
  return (
    <Suspense>
      <CreateOfferView />
    </Suspense>
  );
}
