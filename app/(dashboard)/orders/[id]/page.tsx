import type { Metadata } from "next";

import { OrderDetailView } from "@/modules/orders";

export const metadata: Metadata = {
  title: "Order Details | PetroTrade ADMIN PANEL",
  description:
    "Manage customer order from acceptance through payment, dispatch, tracking and delivery",
};

export default function OrderDetailPage() {
  return <OrderDetailView />;
}
