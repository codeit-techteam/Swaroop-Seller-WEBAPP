import { createRouteMetadata } from "@/components/common";
import { ProcurementNegotiationView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement negotiation",
  "Counter offers and supplier negotiation workspace",
);

export default async function ProcurementNegotiationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcurementNegotiationView id={id} />;
}
