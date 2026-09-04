import { createRouteMetadata } from "@/components/common";
import { SellerSupportView } from "@/modules/seller-support/support-view";

export const metadata = createRouteMetadata(
  "Support",
  "Contact your account manager or raise an issue",
);

export default function SupportPage() {
  return <SellerSupportView />;
}
