import { createRouteMetadata } from "@/components/common";
import { SellerAnalyticsView } from "@/modules/analytics";

export const metadata = createRouteMetadata(
  "Analytics",
  "Seller revenue, orders, warehouse and settlement analytics",
);

export default function AnalyticsPage() {
  return <SellerAnalyticsView />;
}
