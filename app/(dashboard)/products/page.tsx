import { createRouteMetadata } from "@/components/common";
import { SellerProductsView } from "@/modules/grades/products-view";

export const metadata = createRouteMetadata(
  "My Products",
  "Manage grades, stock and offer readiness",
);

export default function ProductsPage() {
  return <SellerProductsView />;
}
