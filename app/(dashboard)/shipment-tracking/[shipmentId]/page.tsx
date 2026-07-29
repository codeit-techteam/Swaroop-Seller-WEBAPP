"use client";

import { use } from "react";

import { ShipmentTrackingView } from "@/modules/shipments";

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  return <ShipmentTrackingView initialShipmentId={shipmentId} />;
}
