import { createRouteMetadata } from "@/components/common";
import { SellerVerificationView } from "@/modules/seller-verification/verification-view";

export const metadata = createRouteMetadata(
  "Verification",
  "Seller KYC documents and review status",
);

export default function VerificationPage() {
  return <SellerVerificationView />;
}
