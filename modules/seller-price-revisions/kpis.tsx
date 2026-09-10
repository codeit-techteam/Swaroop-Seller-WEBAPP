import { CheckCircle2, Clock3, Handshake, IndianRupee, XCircle } from "lucide-react";

import { SellerKpiCard } from "@/components/seller/seller-kpi-card";
import type { PriceRevision } from "@/types/seller-ops";

export function PriceRevisionKpis({ rows }: { rows: PriceRevision[] }) {
  const pending = rows.filter((item) => item.status === "PENDING").length;
  const awaiting = rows.filter((item) => item.status === "AWAITING_RESPONSE").length;
  const accepted = rows.filter((item) => item.status === "ACCEPTED").length;
  const counters = rows.filter((item) => item.status === "COUNTER_OFFER").length;
  const rejected = rows.filter((item) => item.status === "REJECTED").length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SellerKpiCard label="Pending Requests" value={pending} icon={Clock3} />
      <SellerKpiCard
        label="Awaiting Response"
        value={awaiting}
        icon={IndianRupee}
        tone="warning"
      />
      <SellerKpiCard
        label="Accepted"
        value={accepted}
        icon={CheckCircle2}
        tone="success"
      />
      <SellerKpiCard label="Counter Offers" value={counters} icon={Handshake} />
      <SellerKpiCard
        label="Rejected"
        value={rejected}
        icon={XCircle}
        tone="danger"
      />
    </div>
  );
}
