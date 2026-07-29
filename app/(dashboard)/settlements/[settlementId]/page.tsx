"use client";

import { use } from "react";

import { SettlementsView } from "@/modules/settlements";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ settlementId: string }>;
}) {
  const { settlementId } = use(params);
  return <SettlementsView initialSettlementId={settlementId} />;
}
