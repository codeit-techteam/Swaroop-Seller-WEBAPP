import { createRouteMetadata } from "@/components/common";
import { InventoryView } from "@/modules/inventory";

export const metadata = createRouteMetadata(
  "Inventory",
  "Manage warehouse inventory",
);

export default function InventoryPage() {
  return <InventoryView />;
}
