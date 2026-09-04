import { createRouteMetadata } from "@/components/common";
import { SellerDispatchView } from "@/modules/seller-logistics/logistics-view";

export const metadata = createRouteMetadata(
  "Dispatch",
  "Schedule and mark seller dispatches",
);

export default function DispatchPage() {
  return <SellerDispatchView />;
}
