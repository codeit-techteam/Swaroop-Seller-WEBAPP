import { createRouteMetadata } from "@/components/common";
import { ProcurementDetailView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Purchase Request",
  "Purchase request detail",
);

export default async function PurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcurementDetailView id={id} />;
}
