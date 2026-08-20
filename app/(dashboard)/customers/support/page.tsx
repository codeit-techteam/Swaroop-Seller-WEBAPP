import { createRouteMetadata } from "@/components/common";
import { SupportTicketsView } from "@/modules/support";

export const metadata = createRouteMetadata(
  "Customer support",
  "Support tickets",
);

export default function CustomerSupportPage() {
  return <SupportTicketsView />;
}
