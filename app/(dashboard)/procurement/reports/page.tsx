import { createRouteMetadata } from "@/components/common";
import { ProcurementReportsView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Reports",
  "Procurement performance, spend and processing reports",
);

export default function ProcurementReportsPage() {
  return <ProcurementReportsView />;
}
