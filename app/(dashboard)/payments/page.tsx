import { createRouteMetadata } from "@/components/common";
import { SellerPaymentsView } from "@/modules/seller-finance/finance-views";

export const metadata = createRouteMetadata(
  "Payment History",
  "Received payments against your orders",
);

export default function PaymentsPage() {
  return <SellerPaymentsView />;
}
