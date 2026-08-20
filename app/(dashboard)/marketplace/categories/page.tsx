import { createRouteMetadata } from "@/components/common";
import { CategoriesView } from "@/modules/marketplace";

export const metadata = createRouteMetadata(
  "Categories",
  "Marketplace categories",
);

export default function CategoriesPage() {
  return <CategoriesView />;
}
