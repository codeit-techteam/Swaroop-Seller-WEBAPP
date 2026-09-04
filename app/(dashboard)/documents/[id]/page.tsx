"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { formatDate } from "@/lib/utils";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const documents = useSellerFinanceStore((s) => s.documents);
  const document = documents.find((item) => item.id === params.id);

  if (!document) {
    return (
      <PageContainer>
        <PageHeader title="Document" />
        <EmptyState
          title="Document not found"
          description="This document is not in your seller document centre."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={document.name}
        description={document.category}
        actions={<SellerStatusBadge status={document.status} />}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["File", document.fileName],
          ["Uploaded on", formatDate(document.uploadedAt)],
          ["Expiry", document.expiresAt ? formatDate(document.expiresAt) : "—"],
          ["Version", String(document.version ?? 1)],
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
