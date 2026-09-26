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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { KpiCard } from "@/components/cards/kpi-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SkeletonTable } from "@/components/common/skeleton-card";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { DocumentsPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Timeline } from "@/components/status/timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useInvalidateSellerSettlements,
  useSellerSettlement,
  useSellerSettlements,
  useSellerSettlementSummary,
} from "@/hooks/use-seller-settlements";
import { ROUTES } from "@/lib/constants";
import { formatInrShort } from "@/lib/seller/format";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import {
  getSellerDocumentDownloadUrl,
  getSellerDocumentPreviewUrl,
  openSignedDocumentUrl,
  SELLER_DOCUMENT_UI_CATEGORIES,
  sellerDocumentsApiError,
} from "@/services/seller-documents";
import { settlementApiError } from "@/services/settlements";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";
import type { DocumentCategory, SellerDocumentRecord } from "@/types/seller";
import {
  type SellerSettlementStatus,
  SETTLEMENT_STATUS_FILTERS,
} from "@/types/seller-settlement";

function safeDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const formatted = withTime ? formatDateTime(value) : formatDate(value);
  return formatted || "—";
}

export function SellerSettlementsView({
  initialSettlementId = null,
}: {
  initialSettlementId?: string | null;
}) {
  const router = useRouter();
  const invalidate = useInvalidateSellerSettlements();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState<"all" | SellerSettlementStatus>("all");
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const selectedId = initialSettlementId ?? drawerId;

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: searchDebounced || undefined,
      status,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [page, searchDebounced, status],
  );

  const listQuery = useSellerSettlements(listParams);
  const summaryQuery = useSellerSettlementSummary();
  const detailQuery = useSellerSettlement(selectedId, Boolean(selectedId));

  const settlements = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const summary = summaryQuery.data;
  const selected = detailQuery.data ?? null;

  const listError =
    listQuery.isError || summaryQuery.isError
      ? settlementApiError(listQuery.error ?? summaryQuery.error)
      : null;

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateStatus = (value: "all" | SellerSettlementStatus) => {
    setStatus(value);
    setPage(1);
  };

  const openSettlement = (id: string) => {
    setDrawerId(id);
    router.replace(`${ROUTES.SETTLEMENTS}/${id}`, { scroll: false });
  };

  const closeSettlement = () => {
    setDrawerId(null);
    router.replace(ROUTES.SETTLEMENTS, { scroll: false });
  };

  const refreshAll = () => {
    void invalidate();
    void listQuery.refetch();
    void summaryQuery.refetch();
    if (selectedId) void detailQuery.refetch();
  };

  if (listQuery.isLoading && !listQuery.data) {
    return (
      <PageContainer className="space-y-5">
        <PageHeader
          title="Settlements"
          description="Track receivables and settled amounts against your orders"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border bg-white"
            />
          ))}
        </div>
        <SkeletonTable rows={6} />
      </PageContainer>
    );
  }

  if (listError && !listQuery.data) {
    return (
      <PageContainer>
        <PageHeader
          title="Settlements"
          description="Track receivables and settled amounts against your orders"
        />
        <ErrorState title={listError} onRetry={refreshAll} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Settlements"
          description="Track receivables and settled amounts against your orders"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={listQuery.isFetching || summaryQuery.isFetching}
          aria-label="Refresh settlements"
        >
          <RefreshCw
            className={cn(
              "mr-1.5 h-4 w-4",
              (listQuery.isFetching || summaryQuery.isFetching) &&
                "animate-spin",
            )}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Sales"
          value={formatInrShort(summary?.totalSales ?? 0)}
          icon={CircleDollarSign}
        />
        <KpiCard
          label="Settled"
          value={formatInrShort(summary?.settledAmount ?? 0)}
          icon={Banknote}
        />
        <KpiCard
          label="Pending Settlement"
          value={formatInrShort(summary?.pendingSettlementAmount ?? 0)}
          icon={Wallet}
        />
        <KpiCard
          label="Next Settlement"
          value={
            summary?.nextSettlementAmount == null
              ? "—"
              : formatInrShort(summary.nextSettlementAmount)
          }
          icon={Clock3}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={search}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Search settlement, order or invoice"
          aria-label="Search settlements"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            updateStatus(value as "all" | SellerSettlementStatus)
          }
        >
          <SelectTrigger className="md:w-48" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {SETTLEMENT_STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {settlements.length === 0 ? (
        <EmptyState
          title="No settlements yet"
          description="Settlement records will appear here once eligible orders enter the settlement workflow."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3" scope="col">
                  Settlement ID
                </th>
                <th className="px-4 py-3" scope="col">
                  Order ID
                </th>
                <th className="px-4 py-3" scope="col">
                  Buyer
                </th>
                <th className="px-4 py-3" scope="col">
                  Invoice
                </th>
                <th className="px-4 py-3" scope="col">
                  Gross Amount
                </th>
                <th className="px-4 py-3" scope="col">
                  Deductions
                </th>
                <th className="px-4 py-3" scope="col">
                  Net Amount
                </th>
                <th className="px-4 py-3" scope="col">
                  Settlement Date
                </th>
                <th className="px-4 py-3" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => {
                const orderHref = item.purchaseOrderId
                  ? `${ROUTES.ORDERS}/${item.purchaseOrderId}`
                  : null;
                const orderLabel =
                  item.orderNumber ?? item.purchaseOrderId ?? "—";
                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="font-medium text-[#1B6EF3] hover:underline"
                        onClick={() => openSettlement(item.id)}
                      >
                        {item.settlementNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {orderHref ? (
                        <Link
                          href={orderHref}
                          className="font-medium text-[#1B6EF3] hover:underline"
                        >
                          {orderLabel}
                        </Link>
                      ) : (
                        orderLabel
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.buyer.displayName || "Anonymous Buyer"}
                    </td>
                    <td className="px-4 py-3">
                      {item.invoiceNumber ?? item.proformaInvoiceNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatInrShort(item.grossAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {formatInrShort(item.deductions)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatInrShort(item.netAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {safeDate(item.settlementDate ?? item.releasedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <SellerStatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || listQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <DetailDrawer
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) closeSettlement();
        }}
        title={
          selected?.settlementNumber ??
          detailQuery.data?.settlementNumber ??
          "Settlement"
        }
      >
        {detailQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : detailQuery.isError ? (
          <ErrorState
            title={settlementApiError(detailQuery.error)}
            onRetry={() => void detailQuery.refetch()}
          />
        ) : selected ? (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <SellerStatusBadge status={selected.status} />
              <span className="text-slate-500">
                {safeDate(selected.settlementDate ?? selected.releasedAt, true)}
              </span>
            </div>

            {selected.pendingReason ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                {selected.pendingReason}
              </div>
            ) : null}

            <section>
              <h3 className="mb-2 font-semibold">Financial Summary</h3>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Gross amount
                  </dt>
                  <dd className="font-medium">
                    {formatInrShort(selected.grossAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Tax</dt>
                  <dd className="font-medium">
                    {formatInrShort(selected.taxAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Deductions
                  </dt>
                  <dd className="font-medium">
                    {formatInrShort(selected.deductions)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Net settlement
                  </dt>
                  <dd className="font-medium">
                    {formatInrShort(selected.netAmount)}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 font-semibold">Deduction Breakdown</h3>
              {selected.deductionBreakdown.length === 0 ? (
                <p className="text-slate-500">
                  {selected.deductions > 0
                    ? `Total deductions ${formatInrShort(selected.deductions)}`
                    : "No deductions recorded"}
                </p>
              ) : (
                <dl className="space-y-2">
                  {selected.deductionBreakdown.map((line) => (
                    <div
                      key={line.code}
                      className="flex items-center justify-between gap-3"
                    >
                      <dt className="text-slate-600">{line.label}</dt>
                      <dd className="font-medium">
                        {formatInrShort(line.amount)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <section>
              <h3 className="mb-2 font-semibold">Related Documents</h3>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Purchase Order
                  </dt>
                  <dd className="font-medium">
                    {selected.relatedPurchaseOrder ? (
                      <Link
                        href={`${ROUTES.ORDERS}/${selected.relatedPurchaseOrder.id}`}
                        className="text-[#1B6EF3] hover:underline"
                      >
                        {selected.relatedPurchaseOrder.referenceNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Invoice</dt>
                  <dd className="font-medium">
                    {selected.relatedInvoice?.invoiceNumber ??
                      selected.invoiceNumber ??
                      "Invoice not available"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Proforma Invoice
                  </dt>
                  <dd className="font-medium">
                    {selected.relatedProformaInvoice?.piNumber ??
                      selected.proformaInvoiceNumber ??
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Buyer</dt>
                  <dd className="font-medium">
                    {selected.buyer.displayName || "Anonymous Buyer"}
                  </dd>
                </div>
              </dl>
            </section>

            {selected.relatedPurchaseOrder ? (
              <section>
                <h3 className="mb-2 font-semibold">Order Information</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Product / Grade
                    </dt>
                    <dd className="font-medium">
                      {selected.relatedPurchaseOrder.gradeName ??
                        selected.relatedPurchaseOrder.productName ??
                        "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Quantity
                    </dt>
                    <dd className="font-medium">
                      {selected.relatedPurchaseOrder.quantity
                        ? `${selected.relatedPurchaseOrder.quantity} ${selected.relatedPurchaseOrder.unit}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Unit Price
                    </dt>
                    <dd className="font-medium">
                      {selected.relatedPurchaseOrder.unitPrice == null
                        ? "—"
                        : formatInrShort(
                            selected.relatedPurchaseOrder.unitPrice,
                          )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Order Value
                    </dt>
                    <dd className="font-medium">
                      {selected.relatedPurchaseOrder.orderValue == null
                        ? "—"
                        : formatInrShort(
                            selected.relatedPurchaseOrder.orderValue,
                          )}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`${ROUTES.ORDERS}/${selected.relatedPurchaseOrder.id}`}
                    >
                      View Order
                    </Link>
                  </Button>
                </div>
              </section>
            ) : null}

            {selected.relatedPayment ? (
              <section>
                <h3 className="mb-2 font-semibold">Payment</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Reference
                    </dt>
                    <dd className="font-medium">
                      {selected.relatedPayment.referenceNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">UTR</dt>
                    <dd className="font-medium">
                      {selected.relatedPayment.utr ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">
                      Verified
                    </dt>
                    <dd className="font-medium">
                      {safeDate(selected.relatedPayment.verifiedAt, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Amount</dt>
                    <dd className="font-medium">
                      {formatInrShort(selected.relatedPayment.amount)}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 font-semibold">Timeline</h3>
              {selected.timeline.length === 0 ? (
                <p className="text-slate-500">No timeline events yet.</p>
              ) : (
                <Timeline
                  steps={selected.timeline.map((event) => ({
                    id: event.id,
                    label: event.label,
                    status: event.status,
                    at: event.at || undefined,
                  }))}
                />
              )}
            </section>
          </div>
        ) : null}
      </DetailDrawer>
    </PageContainer>
  );
}

export function SellerPaymentsView() {
  const hydrateDocuments = useSellerFinanceStore((s) => s.hydrateDocuments);
  const documentsLoading = useSellerFinanceStore((s) => s.documentsLoading);
  const loadError = useSellerFinanceStore((s) => s.loadError);
  const all = useSellerFinanceStore((s) => s.payments);
  const search = useSellerFinanceStore((s) => s.search);

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

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

  const received = useMemo(
    () => all.filter((item) => item.status === "received"),
    [all],
  );
  const pending = useMemo(
    () => all.filter((item) => item.status === "processing"),
    [all],
  );
  const thisMonth = useMemo(() => {
    const monthPrefix = new Date().toISOString().slice(0, 7);
    return all.filter((item) => item.date?.startsWith(monthPrefix));
  }, [all]);

  if (documentsLoading) {
    return <DocumentsPageSkeleton />;
  }

  if (loadError) {
    return (
      <PageContainer>
        <PageHeader
          title="Payment History"
          description="Payments received against your orders"
        />
        <ErrorState title={loadError} onRetry={() => void hydrateDocuments()} />
      </PageContainer>
    );
  }

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
  const documentsLoading = useSellerFinanceStore((s) => s.documentsLoading);
  const documentsBusy = useSellerFinanceStore((s) => s.documentsBusy);
  const loadError = useSellerFinanceStore((s) => s.loadError);
  const hydrateDocuments = useSellerFinanceStore((s) => s.hydrateDocuments);
  const uploadDocument = useSellerFinanceStore((s) => s.uploadDocument);
  const replaceDocument = useSellerFinanceStore((s) => s.replaceDocument);
  const [category, setCategory] = useState<DocumentCategory>("GST");
  const [preview, setPreview] = useState<{
    open: boolean;
    doc: SellerDocumentRecord | null;
    url: string | null;
    mimeType: string | null;
    loading: boolean;
  }>({
    open: false,
    doc: null,
    url: null,
    mimeType: null,
    loading: false,
  });

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

  const closePreview = () => {
    setPreview({
      open: false,
      doc: null,
      url: null,
      mimeType: null,
      loading: false,
    });
  };

  const handlePreview = async (doc: SellerDocumentRecord) => {
    setPreview({
      open: true,
      doc,
      url: null,
      mimeType: doc.mimeType ?? null,
      loading: true,
    });
    try {
      const result = await getSellerDocumentPreviewUrl(doc.id);
      setPreview({
        open: true,
        doc,
        url: result.url,
        mimeType: result.mimeType ?? doc.mimeType ?? null,
        loading: false,
      });
    } catch (error) {
      closePreview();
      toast.error(
        sellerDocumentsApiError(error, "Unable to open document preview."),
      );
    }
  };

  const handleDownload = async (doc: SellerDocumentRecord) => {
    try {
      const result = await getSellerDocumentDownloadUrl(doc.id);
      openSignedDocumentUrl(result.url, result.fileName ?? doc.fileName);
      toast.success("Download started");
    } catch (error) {
      toast.error(
        sellerDocumentsApiError(error, "Unable to download document."),
      );
    }
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument({ category, file });
      toast.success("Document uploaded and sent for admin verification.");
    } catch (error) {
      toast.error(sellerDocumentsApiError(error, "Upload failed."));
    }
  };

  const handleReplace = async (id: string, file: File) => {
    try {
      await replaceDocument({ id, file });
      toast.success("Document replaced and re-submitted for admin approval.");
    } catch (error) {
      toast.error(sellerDocumentsApiError(error, "Replace failed."));
    }
  };

  if (documentsLoading) {
    return <DocumentsPageSkeleton />;
  }

  if (loadError) {
    return (
      <PageContainer>
        <PageHeader
          title="Documents"
          description="Manage your GST, PAN, bank and compliance documents."
        />
        <ErrorState title={loadError} onRetry={() => void hydrateDocuments()} />
      </PageContainer>
    );
  }

  const isImage =
    preview.mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|webp)$/i.test(preview.doc?.fileName ?? "");

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
          disabled={documentsBusy}
        >
          {SELLER_DOCUMENT_UI_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label
          className={cn(
            "inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#0B1F3A] px-3.5 text-sm font-medium text-white hover:bg-[#122846]",
            documentsBusy && "pointer-events-none opacity-60",
          )}
        >
          <Upload className="h-4 w-4" />
          {documentsBusy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            disabled={documentsBusy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void handleUpload(file);
            }}
          />
        </label>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload GST, PAN, Aadhaar, bank proof, or other compliance files. Documents from onboarding appear here automatically."
        />
      ) : (
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
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-slate-900 hover:text-[#1B6EF3] hover:underline"
                    >
                      {doc.name}
                    </Link>
                    {doc.status === "rejected" && doc.rejectionReason ? (
                      <p className="mt-1 text-xs text-red-600">
                        Rejected: {doc.rejectionReason}
                      </p>
                    ) : null}
                    {doc.status === "pending_verification" ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Awaiting admin verification
                      </p>
                    ) : null}
                  </td>
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
                          disabled={documentsBusy}
                          onClick={() => void handlePreview(doc)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-none border-l border-slate-200 px-3 text-slate-600 hover:bg-slate-50 hover:text-[#1B6EF3]"
                          aria-label={`Download ${doc.name}`}
                          disabled={documentsBusy}
                          onClick={() => void handleDownload(doc)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        <label
                          className={cn(
                            "inline-flex h-8 cursor-pointer items-center gap-2 border-l border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1B6EF3]",
                            documentsBusy && "pointer-events-none opacity-60",
                          )}
                          aria-label={`Replace ${doc.name}`}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Replace
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
                            className="sr-only"
                            disabled={documentsBusy}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (!file) return;
                              void handleReplace(doc.id, file);
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
      )}

      <Dialog
        open={preview.open}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      >
        <DialogContent className="flex h-[90vh] max-w-5xl flex-col gap-3 overflow-hidden p-4 sm:rounded-xl">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{preview.doc?.name ?? "Document"}</DialogTitle>
            <DialogDescription>
              {preview.doc
                ? `${preview.doc.category} · ${preview.doc.fileName}`
                : "Document preview"}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-slate-50">
            {preview.loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading preview…
              </div>
            ) : preview.url && isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.url}
                alt={preview.doc?.name ?? "Document"}
                className="h-full w-full object-contain"
              />
            ) : preview.url ? (
              <iframe
                title={preview.doc?.name ?? "Document preview"}
                src={preview.url}
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Preview unavailable
              </div>
            )}
          </div>
          <div className="flex shrink-0 justify-end gap-2">
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            {preview.doc ? (
              <Button onClick={() => void handleDownload(preview.doc!)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
