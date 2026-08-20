import { createRouteMetadata } from "@/components/common";
import { ReceivablesView } from "@/modules/finance";

export const metadata = createRouteMetadata(
  "Receivables",
  "Customer credit receivables and collection tracking",
);

export default function ReceivablesPage() {
  return <ReceivablesView />;
}
