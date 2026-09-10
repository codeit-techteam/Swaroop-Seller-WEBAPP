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
import { csvEscape } from "@/lib/seller-ops";
import { downloadFile } from "@/lib/utils";
import { useSellerOpsStore } from "@/store/sellerOpsStore";
import type { PriceRevision, PriceRevisionStatus } from "@/types/seller-ops";

import { CounterOfferModal } from "./counter-offer-modal";
import { PriceRevisionDrawer } from "./drawer";
import { PriceRevisionKpis } from "./kpis";
import { PriceRevisionSkeleton } from "./skeleton";
import { PriceRevisionTable } from "./table";

const TABS: { key: "ALL" | PriceRevisionStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "AWAITING_RESPONSE", label: "Awaiting Response" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "COUNTER_OFFER", label: "Counter Offer" },
  { key: "REJECTED", label: "Rejected" },
];

type SortKey = "newest" | "oldest" | "highest" | "lowest";

export function SellerPriceRevisionView() {
  const searchParams = useSearchParams();
  const loading = useSellerOpsStore((s) => s.loading);
  const error = useSellerOpsStore((s) => s.error);
  const busy = useSellerOpsStore((s) => s.busy);
  const revisions = useSellerOpsStore((s) => s.priceRevisions);
  const bootstrap = useSellerOpsStore((s) => s.bootstrap);
  const retry = useSellerOpsStore((s) => s.retry);
  const markRevisionViewed = useSellerOpsStore((s) => s.markRevisionViewed);
  const acceptPriceRevision = useSellerOpsStore((s) => s.acceptPriceRevision);
  const rejectPriceRevision = useSellerOpsStore((s) => s.rejectPriceRevision);
  const submitCounterOffer = useSellerOpsStore((s) => s.submitCounterOffer);

  const [tab, setTab] = useState<"ALL" | PriceRevisionStatus>("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [grade, setGrade] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
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
    void bootstrap();
  }, [bootstrap]);

  const queryId = searchParams.get("id");
  const activeId = selectedId === undefined ? queryId : selectedId;
  const selected = revisions.find((item) => item.id === activeId) ?? null;
  const grades = useMemo(
    () => Array.from(new Set(revisions.map((item) => item.gradeName))),
    [revisions],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return revisions
      .filter((item) => (tab === "ALL" ? true : item.status === tab))
      .filter((item) => (status === "all" ? true : item.status === status))
      .filter((item) => (grade === "all" ? true : item.gradeName === grade))
      .filter((item) => {
        if (!dateFrom && !dateTo) return true;
        const day = item.requestedOn.slice(0, 10);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      })
      .filter((item) => {
        if (!query) return true;
        return [
          item.id,
          item.productName,
          item.gradeName,
          item.buyerName,
          item.orderId ?? "",
          item.purchaseRequestId,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.requestedOn.localeCompare(b.requestedOn);
        if (sort === "highest") return b.totalValue - a.totalValue;
        if (sort === "lowest") return a.totalValue - b.totalValue;
        return b.requestedOn.localeCompare(a.requestedOn);
      });
  }, [dateFrom, dateTo, grade, revisions, search, sort, status, tab]);

  const openRow = (row: PriceRevision) => {
    setSelectedId(row.id);
    markRevisionViewed(row.id);
  };

  const resetFilters = () => {
    setTab("ALL");
    setSearch("");
    setStatus("all");
    setGrade("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
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
      "Quantity",
      "Total Value",
      "Status",
    ];
    const lines = [
      header.join(","),
      ...filtered.map((row) =>
        [
          csvEscape(row.id),
          csvEscape(row.productName),
          csvEscape(row.gradeName),
          csvEscape(row.buyerName),
          row.originalPrice,
          row.requestedPrice,
          row.quantityMt,
          row.totalValue,
          row.status,
        ].join(","),
      ),
    ];
    downloadFile(lines.join("\n"), "price-revisions.csv", "text/csv");
    toast.success("Export downloaded");
  };

  if (loading) {
    return (
      <PageContainer>
        <PriceRevisionSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load price revisions."
          description="Please try again."
          onRetry={() => void retry()}
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

      <PriceRevisionKpis rows={revisions} />

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
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
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search request, product, grade, buyer or order"
          className="lg:col-span-2"
        />
        <Select value={status} onValueChange={setStatus}>
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
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger>
            <SelectValue placeholder="Product / Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {grades.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
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
        <Button variant="ghost" className="lg:col-span-6 w-fit" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No price revision requests"
            description="There are no revision requests matching the current filters."
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <PriceRevisionTable
              rows={filtered}
              onView={openRow}
              onRespond={openRow}
            />
          </TooltipProvider>
        )}
      </div>

      <PriceRevisionDrawer
        revision={selected}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onAccept={() => setAcceptOpen(true)}
        onCounter={() => {
          setCounterPrice(
            selected ? String(selected.counterPrice ?? selected.requestedPrice) : "",
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
                await acceptPriceRevision(selected.id);
                setAcceptOpen(false);
                toast.success("Price revision accepted.");
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
                await rejectPriceRevision(selected.id, rejectReason.trim());
                setRejectOpen(false);
                setRejectReason("");
                toast.success("Price revision rejected.");
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
          await submitCounterOffer(selected.id, {
            counterPrice: Number(counterPrice),
            reason: counterReason,
            validity: counterValidity,
            additionalTerms: counterTerms,
          });
          setCounterOpen(false);
          toast.success("Counter offer submitted.");
        }}
      />
    </PageContainer>
  );
}
