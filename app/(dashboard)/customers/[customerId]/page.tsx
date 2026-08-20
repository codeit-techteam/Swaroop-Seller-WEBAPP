import { Suspense } from "react";

import { createRouteMetadata } from "@/components/common";
import { CustomerDetailView } from "@/modules/customers";

export const metadata = createRouteMetadata("Customer 360", "Customer profile");

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return (
    <Suspense>
      <CustomerDetailView customerId={customerId} />
    </Suspense>
  );
}
