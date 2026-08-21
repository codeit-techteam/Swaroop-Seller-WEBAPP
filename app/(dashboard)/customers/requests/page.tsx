import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CustomerRequestsView } from "@/modules/customers";

export const metadata = createRouteMetadata(
  "Customer requests",
  "Customer purchase requests from APP and WEB",
);

export default function CustomerRequestsPage() {
  return (
    <Suspense>
      <CustomerRequestsView />
    </Suspense>
  );
}
