import { createRouteMetadata } from "@/components/common";
import { ProcurementQueueView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Queue",
  "Review and process incoming purchase requests",
);

export default function ProcurementQueuePage() {
  return <ProcurementQueueView />;
}
