import { createRouteMetadata } from "@/components/common";
import { SellerRequestsView } from "@/modules/seller-requests/requests-view";

export const metadata = createRouteMetadata(
  "Purchase Requests",
  "Respond to incoming buyer requests",
);

export default function PurchaseRequestsPage() {
  return <SellerRequestsView />;
}
