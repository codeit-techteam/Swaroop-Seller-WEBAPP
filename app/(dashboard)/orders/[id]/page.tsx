import type { Metadata } from "next";

import { OrderDetailView } from "@/modules/orders";

export const metadata: Metadata = {
  title: "Order Details | PetroTrade ADMIN PANEL",
  description: "Review order details, accept or reject allocated orders",
};

export default function OrderDetailPage() {
  return <OrderDetailView />;
}
