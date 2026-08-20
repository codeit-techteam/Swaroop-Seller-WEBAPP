import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CustomerRequestsView } from "@/modules/customers";

export const metadata = createRouteMetadata(
  "Customer requests",
  "Customer purchase requests in the procurement queue",
);

export default function CustomerRequestsPage() {
  return (
    <Suspense>
      <CustomerRequestsView />
    </Suspense>
  );
}
