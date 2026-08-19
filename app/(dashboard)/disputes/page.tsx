import { createRouteMetadata } from "@/components/common";
import { DisputesView } from "@/modules/disputes";

export const metadata = createRouteMetadata(
  "Disputes",
  "Order and settlement disputes",
);

export default function DisputesPage() {
  return <DisputesView />;
}
