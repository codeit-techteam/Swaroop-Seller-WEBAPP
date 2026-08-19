import { createRouteMetadata } from "@/components/common";
import { InventoryReservationsView } from "@/modules/inventory";

export const metadata = createRouteMetadata(
  "Inventory Reservations",
  "Reserved stock against live orders",
);

export default function InventoryReservationsPage() {
  return <InventoryReservationsView />;
}
