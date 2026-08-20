import { createRouteMetadata } from "@/components/common";
import { MarketplaceOffersView } from "@/modules/marketplace";

export const metadata = createRouteMetadata("Offers", "Customer promotions");

export default function MarketplaceOffersPage() {
  return <MarketplaceOffersView />;
}
