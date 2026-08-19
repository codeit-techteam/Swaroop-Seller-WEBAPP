import { createRouteMetadata } from "@/components/common";
import { ProcurementWorkbenchView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Workbench",
  "Operations queue for purchase requests and purchase orders",
);

export default function ProcurementPage() {
  return <ProcurementWorkbenchView />;
}
