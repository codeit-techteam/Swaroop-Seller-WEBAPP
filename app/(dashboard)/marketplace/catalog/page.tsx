import { createRouteMetadata } from "@/components/common";
import { CatalogView } from "@/modules/marketplace";

export const metadata = createRouteMetadata(
  "Catalog",
  "Customer-facing product catalog",
);

export default function CatalogPage() {
  return <CatalogView />;
}
