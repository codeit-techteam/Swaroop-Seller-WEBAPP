import { createRouteMetadata } from "@/components/common";
import { NegotiationListView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Price Negotiation",
  "Active commercial negotiations",
);

export default function NegotiationListPage() {
  return <NegotiationListView />;
}
