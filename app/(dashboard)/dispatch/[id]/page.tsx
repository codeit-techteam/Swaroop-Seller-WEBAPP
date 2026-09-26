"use client";

import { useParams } from "next/navigation";

import { SellerDispatchView } from "@/modules/seller-logistics/logistics-view";

export default function DispatchDetailPage() {
  const params = useParams<{ id: string }>();
  return <SellerDispatchView initialDispatchId={params.id} />;
}
