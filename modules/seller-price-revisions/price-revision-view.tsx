"use client";

import { Download, Filter, IndianRupee, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useAcceptPriceRevision,
  useCounterPriceRevision,
  useRejectPriceRevision,
  useSellerPriceRevision,
  useSellerPriceRevisions,
  useSellerPriceRevisionSummary,
} from "@/hooks/use-seller-price-revisions";
import { csvEscape } from "@/lib/seller-ops";
import { downloadFile } from "@/lib/utils";
import { priceRevisionApiError } from "@/services/price-revisions";
import type {
  SellerPriceRevision,
  SellerPriceRevisionStatus,
} from "@/types/seller-price-revision";
import { priceRevisionStatusConfig } from "@/types/seller-price-revision";

import { CounterOfferModal } from "./counter-offer-modal";
import { PriceRevisionDrawer } from "./drawer";
import { PriceRevisionKpis } from "./kpis";
import { PriceRevisionSkeleton } from "./skeleton";
import { PriceRevisionTable } from "./table";

const TABS: { key: "ALL" | SellerPriceRevisionStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: priceRevisionStatusConfig.PENDING.label },
  {
    key: "AWAITING_RESPONSE",
    label: priceRevisionStatusConfig.AWAITING_RESPONSE.label,
  },
  { key: "ACCEPTED", label: priceRevisionStatusConfig.ACCEPTED.label },
  {
    key: "COUNTER_OFFER",
    label: priceRevisionStatusConfig.COUNTER_OFFER.label,
  },
  { key: "REJECTED", label: priceRevisionStatusConfig.REJECTED.label },
];

type SortKey = "newest" | "oldest" | "highest" | "lowest";

export function SellerPriceRevisionView() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"ALL" | SellerPriceRevisionStatus>("ALL");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [gradeId, setGradeId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterReason, setCounterReason] = useState("");
  const [counterValidity, setCounterValidity] = useState("7 days");
  const [counterTerms, setCounterTerms] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const effectiveStatus =
    tab !== "ALL" ? tab : status !== "all" ? status : undefined;

  const listParams = useMemo(
    () => ({
      page,
      limit: 20,
      status: effectiveStatus,
      gradeId: gradeId !== "all" ? gradeId : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      sort,
      search: searchDebounced || undefined,
    }),
    [page, effectiveStatus, gradeId, dateFrom, dateTo, sort, searchDebounced],
  );

  const listQuery = useSellerPriceRevisions(listParams);
  const summaryQuery = useSellerPriceRevisionSummary();
  const acceptMutation = useAcceptPriceRevision();
  const rejectMutation = useRejectPriceRevision();
  const counterMutation = useCounterPriceRevision();

  const queryId = searchParams.get("id");
  const activeId = selectedId === undefined ? queryId : selectedId;
  const detailQuery = useSellerPriceRevision(
    activeId ?? null,
    Boolean(activeId),
  );

  const revisions = useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items],
  );
  const meta = listQuery.data?.meta;
  const selected =
    detailQuery.data ?? revisions.find((item) => item.id === activeId) ?? null;

  const grades = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of revisions) {
      if (row.grade?.id) {
        map.set(row.grade.id, row.grade.displayName || row.grade.name);
      }
    }
    return Array.from(map.entries());
  }, [revisions]);

  const busy =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    counterMutation.isPending;

  const openRow = (row: SellerPriceRevision) => {
    setSelectedId(row.id);
  };

  const resetFilters = () => {
    setTab("ALL");
    setSearch("");
    setSearchDebounced("");
    setStatus("all");
    setGradeId("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setPage(1);
    toast.success("Filters reset");
  };

  const exportCsv = () => {
    const header = [
      "Request ID",
      "Product",
      "Grade",
      "Buyer",
      "Original Price",
      "Requested Price",
      "Difference %",
      "Quantity",
      "Total Value",
      "Requested On",
      "Deadline",
      "Status",
    ];
    const lines = [
      header.join(","),
      ...revisions.map((row) =>
        [
          csvEscape(row.requestNumber),
          csvEscape(row.product?.name ?? ""),
          csvEscape(row.grade?.displayName ?? row.grade?.name ?? ""),
          csvEscape("Anonymous Buyer"),
          row.originalPrice,
          row.requestedPrice,
          row.differencePercent,
          `${row.quantity} ${row.unit}`,
          row.totalValue,
          row.requestedOn,
          row.responseDeadline ?? "",
          row.status,
        ].join(","),
      ),
    ];
    downloadFile(lines.join("\n"), "price-revisions.csv", "text/csv");
    toast.success("Export downloaded");
  };

  if (listQuery.isLoading && !listQuery.data) {
    return (
      <PageContainer>
        <PriceRevisionSkeleton />
      </PageContainer>
    );
  }

  if (listQuery.isError && !listQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load price revisions."
          description={priceRevisionApiError(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Price Revision"
        description="Review and respond to price revision requests from buyers."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </>
        }
      />

      <PriceRevisionKpis
        summary={summaryQuery.data}
        loading={summaryQuery.isLoading}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              tab === item.key
                ? "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-6">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search request, product, grade or order"
          className="lg:col-span-2"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TABS.filter((item) => item.key !== "ALL").map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={gradeId}
          onValueChange={(value) => {
            setGradeId(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Product / Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {grades.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value as SortKey);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="highest">Highest Value</SelectItem>
            <SelectItem value="lowest">Lowest Value</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          className="lg:col-span-6 w-fit"
          onClick={resetFilters}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <div className="mt-4">
        {revisions.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No price revision requests found."
            description="There are no revision requests matching the current filters."
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <PriceRevisionTable
              rows={revisions}
              onView={openRow}
              onRespond={openRow}
            />
          </TooltipProvider>
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || listQuery.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <PriceRevisionDrawer
        revision={selected}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onAccept={() => setAcceptOpen(true)}
        onCounter={() => {
          setCounterPrice(
            selected
              ? String(selected.counterPrice ?? selected.requestedPrice)
              : "",
          );
          setCounterReason("");
          setCounterOpen(true);
        }}
        onReject={() => setRejectOpen(true)}
      />

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept the requested buyer price?</DialogTitle>
            <DialogDescription>
              This will accept the commercial revision and move the related
              procurement record toward a purchase order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0B1F3A] hover:bg-[#122846]"
              disabled={busy}
              onClick={async () => {
                if (!selected) return;
                try {
                  await acceptMutation.mutateAsync({ id: selected.id });
                  setAcceptOpen(false);
                  toast.success("Price revision accepted.");
                } catch (error) {
                  toast.error(priceRevisionApiError(error));
                }
              }}
            >
              {busy ? "Accepting..." : "Accept Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject price revision</DialogTitle>
            <DialogDescription>
              A rejection reason is required before this request can be closed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy || !rejectReason.trim()}
              onClick={async () => {
                if (!selected) return;
                try {
                  await rejectMutation.mutateAsync({
                    id: selected.id,
                    reason: rejectReason.trim(),
                  });
                  setRejectOpen(false);
                  setRejectReason("");
                  toast.success("Price revision rejected.");
                } catch (error) {
                  toast.error(priceRevisionApiError(error));
                }
              }}
            >
              {busy ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CounterOfferModal
        open={counterOpen}
        busy={busy}
        price={counterPrice}
        reason={counterReason}
        validity={counterValidity}
        terms={counterTerms}
        onPriceChange={setCounterPrice}
        onReasonChange={setCounterReason}
        onValidityChange={setCounterValidity}
        onTermsChange={setCounterTerms}
        onOpenChange={setCounterOpen}
        onSubmit={async () => {
          if (!selected) return;
          try {
            await counterMutation.mutateAsync({
              id: selected.id,
              counterPrice: Number(counterPrice),
              message: [counterReason, counterTerms, counterValidity]
                .filter(Boolean)
                .join(" | "),
            });
            setCounterOpen(false);
            toast.success("Counter offer submitted.");
          } catch (error) {
            toast.error(priceRevisionApiError(error));
          }
        }}
      />
    </PageContainer>
  );
}
