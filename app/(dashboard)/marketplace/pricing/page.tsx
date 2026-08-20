import { createRouteMetadata } from "@/components/common";
import { PricingView } from "@/modules/marketplace";

export const metadata = createRouteMetadata(
  "Pricing",
  "Customer-facing pricing",
);

export default function PricingPage() {
  return <PricingView />;
}
