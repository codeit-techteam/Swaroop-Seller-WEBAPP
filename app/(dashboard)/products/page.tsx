import type { Metadata } from "next";

import {
  createRouteMetadata,
  RoutePlaceholder,
} from "@/components/common/route-placeholder";

export const metadata: Metadata = createRouteMetadata(
  "Products",
  "Manage product catalog",
);

export default function ProductsPage() {
  return (
    <RoutePlaceholder title="Products" description="Manage product catalog" />
  );
}
