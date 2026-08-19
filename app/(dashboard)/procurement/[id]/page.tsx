import { createRouteMetadata } from "@/components/common";
import { ProcurementDetailView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement details",
  "Review a procurement request or purchase order",
);

export default async function ProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcurementDetailView id={id} />;
}
