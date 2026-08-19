import { createRouteMetadata } from "@/components/common";
import { SuppliersView } from "@/modules/users";

export const metadata = createRouteMetadata(
  "Sellers / Suppliers",
  "Supplier directory for operations",
);

export default function SuppliersPage() {
  return <SuppliersView />;
}
