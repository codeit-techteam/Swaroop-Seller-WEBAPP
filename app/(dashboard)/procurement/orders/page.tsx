import { createRouteMetadata } from "@/components/common";
import { ProcurementOrdersView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Orders",
  "Procurement purchase orders and seller confirmation",
);

export default function ProcurementOrdersPage() {
  return <ProcurementOrdersView />;
}
