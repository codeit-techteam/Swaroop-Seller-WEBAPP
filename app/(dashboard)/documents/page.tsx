import { createRouteMetadata } from "@/components/common";
import { SellerDocumentsView } from "@/modules/seller-finance/finance-views";

export const metadata = createRouteMetadata(
  "Documents",
  "Manage your seller compliance documents",
);

export default function DocumentsPage() {
  return <SellerDocumentsView />;
}
