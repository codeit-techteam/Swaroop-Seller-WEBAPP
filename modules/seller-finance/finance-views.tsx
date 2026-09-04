"use client";

import {
  Banknote,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  RefreshCw,
  Upload,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { KpiCard } from "@/components/cards/kpi-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SkeletonTable } from "@/components/common/skeleton-card";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Timeline } from "@/components/status/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { ROUTES } from "@/lib/constants";
import { getSettlements } from "@/lib/repositories/settlements";
import { formatInrShort } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";
import type { DocumentCategory } from "@/types/seller";

export function SellerSettlementsView() {
  const { data, loading, error, retry } = useAsyncResource(
    () => getSettlements(),
    [],
    "Unable to load settlements.",
  );
  const storeSettlements = useSellerFinanceStore((s) => s.settlements);
  const all = data ?? storeSettlements;
  const search = useSellerFinanceStore((s) => s.search);
  const status = useSellerFinanceStore((s) => s.status);
  const setSearch = useSellerFinanceStore((s) => s.setSearch);
  const setStatus = useSellerFinanceStore((s) => s.setStatus);
  const selectedSettlementId = useSellerFinanceStore(
    (s) => s.selectedSettlementId,
  );
  const openSettlement = useSellerFinanceStore((s) => s.openSettlement);
  const closeSettlement = useSellerFinanceStore((s) => s.closeSettlement);

  const settlements = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!query) return true;
      return (
        item.settlementId.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query) ||
        item.buyerRef.toLowerCase().includes(query) ||
        item.invoiceRef.toLowerCase().includes(query)
      );
    });
  }, [all, search, status]);

  const selected = all.find((item) => item.id === selectedSettlementId);
  const settled = all.filter((item) => item.status === "settled");
  const pending = all.filter((item) => item.status === "processing");
  const next = all.filter((item) => item.status === "pending");

  if (loading) {
    return (
      <PageContainer className="space-y-5">
        <PageHeader
          title="Settlements"
          description="Track receivables and settled amounts against your orders"
        />
        <SkeletonTable rows={6} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Settlements"
          description="Track receivables and settled amounts against your orders"
        />
        <ErrorState title={error} onRetry={retry} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Settlements"
        description="Track receivables and settled amounts against your orders"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Sales"
          value={formatInrShort(
            all.reduce((sum, item) => sum + item.grossAmount, 0),
          )}
          icon={CircleDollarSign}
        />
        <KpiCard
          label="Settled"
          value={formatInrShort(
            settled.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={Banknote}
        />
        <KpiCard
          label="Pending Settlement"
          value={formatInrShort(
            pending.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={Wallet}
        />
        <KpiCard
          label="Next Settlement"
          value={formatInrShort(
            next.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={Clock3}
        />
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search settlement, order, invoice or buyer"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {settlements.length === 0 ? (
        <EmptyState
          title="No settlements found"
          description="Settlements against your invoices will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Settlement ID</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Gross Amount</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Amount</th>
                <th className="px-4 py-3">Settlement Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="font-medium text-[#1B6EF3]"
                      onClick={() => openSettlement(item.id)}
                    >
                      {item.settlementId}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${ROUTES.ORDERS}/${item.orderId}`}
                      className="font-medium text-[#1B6EF3] hover:underline"
                    >
                      {item.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.buyerRef}</td>
                  <td className="px-4 py-3">{item.invoiceRef}</td>
                  <td className="px-4 py-3">
                    {formatInrShort(item.grossAmount)}
                  </td>
                  <td className="px-4 py-3">
                    {formatInrShort(item.deductions)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatInrShort(item.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {item.settlementDate
                      ? formatDate(item.settlementDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) closeSettlement();
        }}
        title={selected?.settlementId ?? "Settlement"}
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs uppercase text-slate-500">Order</dt>
                <dd className="font-medium">
                  <Link
                    href={`${ROUTES.ORDERS}/${selected.orderId}`}
                    className="text-[#1B6EF3] hover:underline"
                  >
                    {selected.orderId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Buyer</dt>
                <dd className="font-medium">{selected.buyerRef}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Invoice</dt>
                <dd className="font-medium">{selected.invoiceRef}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Gross amount
                </dt>
                <dd className="font-medium">
                  {formatInrShort(selected.grossAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">GST</dt>
                <dd className="font-medium">
                  {formatInrShort(selected.gstAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Commission</dt>
                <dd className="font-medium">
                  {formatInrShort(selected.commission)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Other deductions
                </dt>
                <dd className="font-medium">
                  {formatInrShort(selected.otherDeductions)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Net payable
                </dt>
                <dd className="font-medium">
                  {formatInrShort(selected.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Payment date
                </dt>
                <dd className="font-medium">
                  {selected.paymentDate
                    ? formatDate(selected.paymentDate)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">
                  Payment reference
                </dt>
                <dd className="font-medium">
                  {selected.paymentReference ?? "—"}
                </dd>
              </div>
            </dl>
            <SellerStatusBadge status={selected.status} />
            <Button
              variant="outline"
              onClick={() => toast.success("Settlement marked as reviewed.")}
            >
              Mark as reviewed
            </Button>
            <div>
              <h3 className="mb-2 font-semibold">Timeline</h3>
              <Timeline steps={selected.timeline} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </PageContainer>
  );
}

export function SellerPaymentsView() {
  const all = useSellerFinanceStore((s) => s.payments);
  const search = useSellerFinanceStore((s) => s.search);
  const payments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (item) =>
        item.paymentId.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query) ||
        item.buyerRef.toLowerCase().includes(query) ||
        item.reference.toLowerCase().includes(query),
    );
  }, [all, search]);
  const received = all.filter((item) => item.status === "received");
  const pending = all.filter((item) => item.status === "processing");
  const thisMonth = all.filter((item) => item.date.startsWith("2026-09"));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Payment History"
        description="Payments received against your orders"
      />
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard
          label="Total Received"
          value={formatInrShort(
            received.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={Banknote}
        />
        <KpiCard
          label="Pending"
          value={formatInrShort(
            pending.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={Wallet}
        />
        <KpiCard
          label="This Month"
          value={formatInrShort(
            thisMonth.reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={CircleDollarSign}
        />
      </div>
      {payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Received payments will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.paymentId}</td>
                  <td className="px-4 py-3">{item.orderId}</td>
                  <td className="px-4 py-3">{item.buyerRef}</td>
                  <td className="px-4 py-3">{formatInrShort(item.amount)}</td>
                  <td className="px-4 py-3">{item.method}</td>
                  <td className="px-4 py-3">{item.reference}</td>
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

export function SellerDocumentsView() {
  const documents = useSellerFinanceStore((s) => s.documents);
  const uploadDocument = useSellerFinanceStore((s) => s.uploadDocument);
  const replaceDocument = useSellerFinanceStore((s) => s.replaceDocument);
  const [category, setCategory] = useState<DocumentCategory>("GST");
  const [loading] = useState(false);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Documents" />
        <SkeletonTable />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Manage your GST, PAN, bank and compliance documents."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as DocumentCategory)
          }
          aria-label="Document category"
        >
          {[
            "GST",
            "PAN",
            "Bank Proof",
            "Company Registration",
            "Address Proof",
            "Compliance Certificates",
            "Other",
          ].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#0B1F3A] px-3.5 text-sm font-medium text-white hover:bg-[#122846]">
          <Upload className="h-4 w-4" />
          Upload
          <input
            type="file"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              uploadDocument({
                name: file.name,
                category,
                status: "pending_verification",
                fileName: file.name,
              });
              toast.success("Document uploaded.");
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Uploaded On</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-4 py-3 font-medium">{doc.name}</td>
                <td className="px-4 py-3">{doc.category}</td>
                <td className="px-4 py-3">{formatDate(doc.uploadedAt)}</td>
                <td className="px-4 py-3">
                  <SellerStatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <div className="inline-flex shrink-0 overflow-hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white shadow-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-none px-3 text-slate-600 hover:bg-slate-50 hover:text-[#1B6EF3]"
                        aria-label={`Preview ${doc.name}`}
                        onClick={() => toast.success("Opening preview")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-none border-l border-slate-200 px-3 text-slate-600 hover:bg-slate-50 hover:text-[#1B6EF3]"
                        aria-label={`Download ${doc.name}`}
                        onClick={() =>
                          toast.success(`Downloading ${doc.fileName}`)
                        }
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                      <label
                        className="inline-flex h-8 cursor-pointer items-center gap-2 border-l border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1B6EF3]"
                        aria-label={`Replace ${doc.name}`}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Replace
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            replaceDocument(doc.id, file.name);
                            toast.success("Document replaced");
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
