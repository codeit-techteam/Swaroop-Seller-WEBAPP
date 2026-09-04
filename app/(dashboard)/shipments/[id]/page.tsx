"use client";

import { useParams } from "next/navigation";

import { SellerShipmentsView } from "@/modules/seller-logistics/logistics-view";

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  return <SellerShipmentsView initialShipmentId={params.id} />;
}
