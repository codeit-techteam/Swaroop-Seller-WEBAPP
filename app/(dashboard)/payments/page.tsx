import { createRouteMetadata } from "@/components/common";
import { PaymentsView } from "@/modules/finance";

export const metadata = createRouteMetadata(
  "Payments",
  "Marketplace payment operations",
);

export default function PaymentsPage() {
  return <PaymentsView />;
}
