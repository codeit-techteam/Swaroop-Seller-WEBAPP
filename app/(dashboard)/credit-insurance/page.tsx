import { createRouteMetadata } from "@/components/common";
import { CreditInsuranceView } from "@/modules/finance";

export const metadata = createRouteMetadata(
  "Credit Insurance",
  "Buyer credit cover and exposure",
);

export default function CreditInsurancePage() {
  return <CreditInsuranceView />;
}
