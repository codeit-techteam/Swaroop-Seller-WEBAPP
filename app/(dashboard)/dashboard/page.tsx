import { createRouteMetadata } from "@/components/common";
import { DashboardView } from "@/modules/dashboard";

export const metadata = createRouteMetadata(
  "Dashboard",
  "Seller operational dashboard overview",
);

export default function DashboardPage() {
  return <DashboardView />;
}
