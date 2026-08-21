import type { Metadata } from "next";

import { OrdersView } from "@/modules/orders";

export const metadata: Metadata = {
  title: "Orders Management | PetroTrade ADMIN PANEL",
  description: "View and manage allocated marketplace orders",
};

export default function OrdersPage() {
  return <OrdersView />;
}
