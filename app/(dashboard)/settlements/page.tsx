import { createRouteMetadata } from "@/components/common";
import { SellerSettlementsView } from "@/modules/seller-finance/finance-views";

export const metadata = createRouteMetadata(
  "Settlements",
  "Track receivables and settled amounts",
);

export default function SettlementsPage() {
  return <SellerSettlementsView />;
}
