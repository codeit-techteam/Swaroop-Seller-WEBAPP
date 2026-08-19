import { createRouteMetadata } from "@/components/common";
import { ReceivablesView } from "@/modules/finance";

export const metadata = createRouteMetadata(
  "Receivables",
  "Outstanding invoices and collections",
);

export default function ReceivablesPage() {
  return <ReceivablesView />;
}
