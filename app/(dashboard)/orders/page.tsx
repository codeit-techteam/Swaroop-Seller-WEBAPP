import { createRouteMetadata } from "@/components/common";
import { SellerOrdersView } from "@/modules/seller-orders/orders-view";

export const metadata = createRouteMetadata(
  "Orders",
  "Manage your seller orders",
);

export default function OrdersPage() {
  return <SellerOrdersView />;
}
