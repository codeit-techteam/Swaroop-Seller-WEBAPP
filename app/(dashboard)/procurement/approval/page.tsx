import { createRouteMetadata } from "@/components/common";
import { ProcurementApprovalView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Approval",
  "Approve finalized procurement and create POs",
);

export default function ProcurementApprovalPage() {
  return <ProcurementApprovalView />;
}
