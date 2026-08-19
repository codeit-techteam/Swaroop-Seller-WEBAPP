import { createRouteMetadata } from "@/components/common";
import { ProcurementNegotiationView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Negotiation detail",
  "Admin and seller commercial negotiation",
);

export default async function NegotiationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcurementNegotiationView id={id} />;
}
