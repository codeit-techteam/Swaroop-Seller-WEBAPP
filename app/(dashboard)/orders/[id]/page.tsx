"use client";

import { useParams } from "next/navigation";

import { SellerOrderDetailView } from "@/modules/seller-orders/orders-view";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  return <SellerOrderDetailView id={params.id} />;
}
