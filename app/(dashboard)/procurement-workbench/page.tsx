import { createRouteMetadata } from "@/components/common";
import { SellerWorkbenchView } from "@/modules/seller-workbench";

export const metadata = createRouteMetadata(
  "Procurement Workbench",
  "Manage purchase requests, orders, pricing, payments and fulfillment from one workspace",
);

export default function ProcurementWorkbenchPage() {
  return <SellerWorkbenchView />;
}
