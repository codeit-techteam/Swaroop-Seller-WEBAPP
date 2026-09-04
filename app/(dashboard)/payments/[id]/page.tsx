"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { formatInrShort } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const payments = useSellerFinanceStore((s) => s.payments);
  const payment =
    payments.find((item) => item.id === params.id) ??
    payments.find((item) => item.paymentId === params.id);

  if (!payment) {
    return (
      <PageContainer>
        <PageHeader title="Payment" />
        <EmptyState
          title="Payment not found"
          description="This payment id is not in the seller ledger."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={payment.paymentId}
        description={`Against ${payment.orderId}`}
        actions={<SellerStatusBadge status={payment.status} />}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Buyer", payment.buyerRef],
          ["Amount", formatInrShort(payment.amount)],
          ["Method", payment.method],
          ["Reference", payment.reference],
          ["Date", formatDate(payment.date)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
