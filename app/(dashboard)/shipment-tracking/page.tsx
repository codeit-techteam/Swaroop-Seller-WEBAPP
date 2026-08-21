import type { Metadata } from "next";

import { ShipmentTrackingView } from "@/modules/shipments";

export const metadata: Metadata = {
  title: "Shipment Tracking | PetroTrade ADMIN PANEL",
  description:
    "Track dispatches and delivery progress across all customer orders.",
};

export default function ShipmentTrackingPage() {
  return <ShipmentTrackingView />;
}
