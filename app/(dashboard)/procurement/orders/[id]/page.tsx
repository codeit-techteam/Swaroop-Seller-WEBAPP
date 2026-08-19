import { createRouteMetadata } from "@/components/common";
import { ProcurementDetailView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Order",
  "Purchase order detail",
);

export default async function ProcurementOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcurementDetailView id={id} />;
}
