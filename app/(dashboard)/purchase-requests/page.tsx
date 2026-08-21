import type { Metadata } from "next";

import { PurchaseRequestsView } from "@/modules/purchase-requests";

export const metadata: Metadata = {
  title: "Purchase Requests | PetroTrade ADMIN PANEL",
  description:
    "Manage incoming material enquiries allocated by PetroTrade Procurement",
};

export default function PurchaseRequestsPage() {
  return <PurchaseRequestsView />;
}
