"use client";

import { useParams } from "next/navigation";

import { SellerSettlementsView } from "@/modules/seller-finance/finance-views";

export default function SettlementDetailPage() {
  const params = useParams<{ id: string }>();
  return <SellerSettlementsView initialSettlementId={params.id} />;
}
