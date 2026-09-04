import { createRouteMetadata } from "@/components/common";
import { SellerOffersView } from "@/modules/seller-offers/offers-view";

export const metadata = createRouteMetadata(
  "My Offers",
  "Create, activate and manage selling offers",
);

export default function OffersPage() {
  return <SellerOffersView />;
}
