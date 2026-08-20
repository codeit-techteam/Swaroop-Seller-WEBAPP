import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CustomerOrdersView } from "@/modules/customers";

export const metadata = createRouteMetadata(
  "Customer orders",
  "Customer-facing order desk",
);

export default function CustomerOrdersPage() {
  return (
    <Suspense>
      <CustomerOrdersView />
    </Suspense>
  );
}
