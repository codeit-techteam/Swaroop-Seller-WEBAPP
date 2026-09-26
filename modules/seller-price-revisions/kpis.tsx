import {
  CheckCircle2,
  Clock3,
  Handshake,
  IndianRupee,
  XCircle,
} from "lucide-react";

import { SellerKpiCard } from "@/components/seller/seller-kpi-card";
import type { SellerPriceRevisionSummary } from "@/types/seller-price-revision";

export function PriceRevisionKpis({
  summary,
  loading,
}: {
  summary?: SellerPriceRevisionSummary | null;
  loading?: boolean;
}) {
  const pending = summary?.pending ?? 0;
  const awaiting = summary?.awaitingResponse ?? 0;
  const accepted = summary?.accepted ?? 0;
  const counters = summary?.counterOffers ?? 0;
  const rejected = summary?.rejected ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SellerKpiCard
        label="Pending Requests"
        value={loading ? "—" : pending}
        icon={Clock3}
      />
      <SellerKpiCard
        label="Awaiting Response"
        value={loading ? "—" : awaiting}
        icon={IndianRupee}
        tone="warning"
      />
      <SellerKpiCard
        label="Accepted"
        value={loading ? "—" : accepted}
        icon={CheckCircle2}
        tone="success"
      />
      <SellerKpiCard
        label="Counter Offers"
        value={loading ? "—" : counters}
        icon={Handshake}
      />
      <SellerKpiCard
        label="Rejected"
        value={loading ? "—" : rejected}
        icon={XCircle}
        tone="danger"
      />
    </div>
  );
}
