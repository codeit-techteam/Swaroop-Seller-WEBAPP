import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CustomersView } from "@/modules/customers";

export const metadata = createRouteMetadata(
  "Customers",
  "Customer lifecycle for Customer APP and Customer WEB",
);

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersView />
    </Suspense>
  );
}
