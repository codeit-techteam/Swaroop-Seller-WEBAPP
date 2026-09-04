import { createRouteMetadata } from "@/components/common";
import { SellerShipmentsView } from "@/modules/seller-logistics/logistics-view";

export const metadata = createRouteMetadata(
  "Shipment Tracking",
  "Track dispatched loads",
);

export default function ShipmentsPage() {
  return <SellerShipmentsView />;
}
