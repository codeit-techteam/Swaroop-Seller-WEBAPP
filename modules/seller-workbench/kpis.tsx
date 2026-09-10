import {
  Banknote,
  ClipboardList,
  IndianRupee,
  PackageCheck,
  Timer,
  Truck,
  Wallet,
} from "lucide-react";

import { SellerKpiCard } from "@/components/seller/seller-kpi-card";
import { formatOpsValue } from "@/lib/seller-ops";
import type { ProcurementRecord } from "@/types/seller-ops";

export function ProcurementKpis({ rows }: { rows: ProcurementRecord[] }) {
  const openPr = rows.filter((item) => item.currentStage === "PR").length;
  const revisions = rows.filter(
    (item) => item.currentStage === "PRICE_REVISION",
  ).length;
  const confirmed = rows.filter((item) =>
    ["PO", "PAYMENT", "DISPATCH", "SHIPMENT", "SETTLEMENT"].includes(
      item.currentStage,
    ),
  ).length;
  const awaitingPayment = rows
    .filter(
      (item) =>
        item.paymentStatus === "PAYMENT_PENDING" ||
        item.paymentStatus === "OVERDUE",
    )
    .reduce((sum, item) => sum + item.payment.amountPending, 0);
  const ready = rows.filter(
    (item) => item.dispatchStatus === "READY_FOR_DISPATCH",
  ).length;
  const transit = rows.filter((item) => item.dispatchStatus === "IN_TRANSIT").length;
  const settlement = rows
    .filter((item) => item.settlementStatus === "SETTLEMENT_PENDING")
    .reduce((sum, item) => sum + item.orderValue, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      <SellerKpiCard label="Open Purchase Requests" value={openPr} icon={ClipboardList} />
      <SellerKpiCard
        label="Pending Price Revisions"
        value={revisions}
        icon={IndianRupee}
        tone="warning"
      />
      <SellerKpiCard label="Confirmed Orders" value={confirmed} icon={PackageCheck} />
      <SellerKpiCard
        label="Awaiting Payment"
        value={formatOpsValue(awaitingPayment)}
        icon={Banknote}
        tone="warning"
      />
      <SellerKpiCard label="Ready for Dispatch" value={ready} icon={Truck} />
      <SellerKpiCard label="In Transit" value={transit} icon={Timer} />
      <SellerKpiCard
        label="Settlement Pending"
        value={formatOpsValue(settlement)}
        icon={Wallet}
      />
    </div>
  );
}
