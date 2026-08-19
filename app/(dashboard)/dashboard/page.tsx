import { createRouteMetadata } from "@/components/common";
import { DashboardView } from "@/modules/dashboard";

export const metadata = createRouteMetadata(
  "Operations Command Center",
  "Live overview of PetroTrade marketplace, procurement and operations",
);

export default function DashboardPage() {
  return <DashboardView />;
}
