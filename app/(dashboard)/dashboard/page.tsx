import { createRouteMetadata } from "@/components/common";
import { DashboardView } from "@/modules/dashboard";

export const metadata = createRouteMetadata(
  "Seller Dashboard",
  "What you need to do as a PetroTrade seller today",
);

export default function DashboardPage() {
  return <DashboardView />;
}
