import { createRouteMetadata } from "@/components/common";
import { InventoryView } from "@/modules/inventory";

export const metadata = createRouteMetadata(
  "Inventory",
  "Track warehouse stock, sellable quantity and replenishment alerts",
);

export default function InventoryPage() {
  return <InventoryView />;
}
