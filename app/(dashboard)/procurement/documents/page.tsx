import { createRouteMetadata } from "@/components/common";
import { ProcurementDocumentsView } from "@/modules/procurement";

export const metadata = createRouteMetadata(
  "Procurement Documents",
  "RFQ, quotation, PO and shipping files",
);

export default function ProcurementDocumentsPage() {
  return <ProcurementDocumentsView />;
}
