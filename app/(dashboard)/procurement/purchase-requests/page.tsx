import { createRouteMetadata } from "@/components/common";
import { ProcurementQueueView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Purchase Requests",
  "Procurement purchase requests",
);

export default function PurchaseRequestsPage() {
  return <ProcurementQueueView />;
}
