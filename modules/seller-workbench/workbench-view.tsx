"use client";

import { Download, KanbanSquare, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/constants";
import { csvEscape } from "@/lib/seller-ops";
import { downloadFile } from "@/lib/utils";
import { CounterOfferModal } from "@/modules/seller-price-revisions/counter-offer-modal";
import { useSellerOpsStore } from "@/store/sellerOpsStore";
import type {
  AlertKind,
  ProcurementPriority,
  ProcurementRecord,
  ProcurementStage,
} from "@/types/seller-ops";

import { ActionRequired } from "./action-required";
import { ProcurementDrawer } from "./drawer";
import { ProcurementKpis } from "./kpis";
import { ProcurementPipeline } from "./pipeline";
import { WorkbenchSkeleton } from "./skeleton";
import { ProcurementTable } from "./table";

export function SellerWorkbenchView() {
  const router = useRouter();
  const loading = useSellerOpsStore((s) => s.loading);
  const error = useSellerOpsStore((s) => s.error);
  const busy = useSellerOpsStore((s) => s.busy);
  const records = useSellerOpsStore((s) => s.procurementRecords);
  const revisions = useSellerOpsStore((s) => s.priceRevisions);
  const bootstrap = useSellerOpsStore((s) => s.bootstrap);
  const retry = useSellerOpsStore((s) => s.retry);
  const acceptPr = useSellerOpsStore((s) => s.acceptPr);
  const rejectPr = useSellerOpsStore((s) => s.rejectPr);
  const openPriceRevision = useSellerOpsStore((s) => s.openPriceRevision);
  const acceptPriceRevision = useSellerOpsStore((s) => s.acceptPriceRevision);
  const rejectPriceRevision = useSellerOpsStore((s) => s.rejectPriceRevision);
  const submitCounterOffer = useSellerOpsStore((s) => s.submitCounterOffer);
  const acknowledgePo = useSellerOpsStore((s) => s.acknowledgePo);
  const confirmPayment = useSellerOpsStore((s) => s.confirmPayment);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<ProcurementStage | "ALL">("ALL");
  const [buyer, setBuyer] = useState("all");
  const [grade, setGrade] = useState("all");
  const [priority, setPriority] = useState("all");
  const [payment, setPayment] = useState("all");
  const [dispatch, setDispatch] = useState("all");
  const [date, setDate] = useState("");
  const [alert, setAlert] = useState<AlertKind | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState<"pr" | "price" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterReason, setCounterReason] = useState("");
  const [counterValidity, setCounterValidity] = useState("7 days");
  const [counterTerms, setCounterTerms] = useState("");

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const selected = records.find((item) => item.id === selectedId) ?? null;
  const linkedRevision = revisions.find(
    (item) =>
      item.id === selected?.priceRevisionId ||
      item.purchaseRequestId === selected?.purchaseRequestId,
  );
  const buyers = useMemo(
    () => Array.from(new Set(records.map((item) => item.buyerName))),
    [records],
  );
  const grades = useMemo(
    () => Array.from(new Set(records.map((item) => item.gradeName))),
    [records],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((item) => {
      if (stage !== "ALL" && item.currentStage !== stage) return false;
      if (buyer !== "all" && item.buyerName !== buyer) return false;
      if (grade !== "all" && item.gradeName !== grade) return false;
      if (priority !== "all" && item.priority !== priority) return false;
      if (payment !== "all" && item.paymentStatus !== payment) return false;
      if (dispatch !== "all" && item.dispatchStatus !== dispatch) return false;
      if (date && item.lastUpdated.slice(0, 10) !== date) return false;
      if (alert !== "ALL" && !item.alerts.includes(alert)) return false;
      if (!query) return true;
      return [
        item.purchaseRequestId,
        item.orderId ?? "",
        item.order.poNumber ?? "",
        item.buyerName,
        item.productName,
        item.gradeName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [alert, buyer, date, dispatch, grade, payment, priority, records, search, stage]);

  const reset = () => {
    setSearch("");
    setStage("ALL");
    setBuyer("all");
    setGrade("all");
    setPriority("all");
    setPayment("all");
    setDispatch("all");
    setDate("");
    setAlert("ALL");
    toast.success("Filters reset");
  };

  const exportCsv = () => {
    const lines = [
      [
        "Reference",
        "Buyer",
        "Product",
        "Grade",
        "Stage",
        "Value",
        "Payment",
        "Dispatch",
        "Priority",
      ].join(","),
      ...filtered.map((row) =>
        [
          csvEscape(row.purchaseRequestId),
          csvEscape(row.buyerName),
          csvEscape(row.productName),
          csvEscape(row.gradeName),
          row.currentStage,
          row.orderValue,
          row.paymentStatus,
          row.dispatchStatus,
          row.priority,
        ].join(","),
      ),
    ];
    downloadFile(lines.join("\n"), "procurement-workbench.csv", "text/csv");
    toast.success("Export downloaded");
  };

  const ensureRevisionId = (record: ProcurementRecord) => {
    return (
      record.priceRevisionId ??
      openPriceRevision(record.purchaseRequestId) ??
      linkedRevision?.id
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <WorkbenchSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load procurement data."
          description="Please try again."
          onRetry={() => void retry()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Procurement Workbench"
        description="Manage purchase requests, orders, pricing, payments and fulfillment from one workspace."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="bg-[#0B1F3A] hover:bg-[#122846]" asChild>
              <Link href={ROUTES.OFFERS_NEW}>
                <Plus className="h-4 w-4" />
                Create Offer
              </Link>
            </Button>
          </>
        }
      />

      <ProcurementKpis rows={records} />
      <div className="mt-5">
        <ProcurementPipeline rows={records} active={stage} onSelect={setStage} />
      </div>
      <div className="mt-5">
        <ActionRequired
          rows={records}
          onView={(kind) => {
            setAlert(kind);
            toast.success("Workbench filtered to action items.");
          }}
        />
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search PR / PO / Order / Buyer / Product / Grade"
          className="lg:col-span-2"
        />
        <Select
          value={stage}
          onValueChange={(value) => setStage(value as ProcurementStage | "ALL")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All stages</SelectItem>
            {[
              "PR",
              "COMMERCIAL_REVIEW",
              "PRICE_REVISION",
              "PO",
              "PAYMENT",
              "DISPATCH",
              "SHIPMENT",
              "SETTLEMENT",
            ].map((item) => (
              <SelectItem key={item} value={item}>
                {item.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={buyer} onValueChange={setBuyer}>
          <SelectTrigger>
            <SelectValue placeholder="Buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All buyers</SelectItem>
            {buyers.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
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
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as ProcurementPriority[]).map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger>
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            {["PAYMENT_PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((item) => (
              <SelectItem key={item} value={item}>
                {item.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dispatch} onValueChange={setDispatch}>
          <SelectTrigger>
            <SelectValue placeholder="Dispatch Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dispatch statuses</SelectItem>
            {[
              "NOT_STARTED",
              "READY_FOR_DISPATCH",
              "DISPATCHED",
              "IN_TRANSIT",
              "DELIVERED",
            ].map((item) => (
              <SelectItem key={item} value={item}>
                {item.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Button variant="ghost" className="w-fit" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={KanbanSquare}
            title="No procurement actions require your attention"
            description="Adjust filters or wait for new purchase requests to arrive."
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <ProcurementTable rows={filtered} onView={(row) => setSelectedId(row.id)} />
          </TooltipProvider>
        )}
      </div>

      <ProcurementDrawer
        record={selected}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onAcceptPr={async () => {
          if (!selected) return;
          await acceptPr(selected.purchaseRequestId);
          toast.success("Purchase request accepted.");
        }}
        onRejectPr={() => setRejectOpen("pr")}
        onOpenRevision={() => {
          if (!selected) return;
          const id = ensureRevisionId(selected);
          if (id) router.push(`${ROUTES.PRICE_REVISIONS}?id=${id}`);
        }}
        onAcceptPrice={async () => {
          if (!selected) return;
          const id = ensureRevisionId(selected);
          if (!id) return;
          await acceptPriceRevision(id);
          toast.success("Price revision accepted.");
          toast.success("Procurement stage updated.");
        }}
        onCounter={() => {
          setCounterPrice(
            linkedRevision
              ? String(linkedRevision.counterPrice ?? linkedRevision.requestedPrice)
              : "",
          );
          setCounterOpen(true);
        }}
        onRejectPrice={() => setRejectOpen("price")}
        onAcknowledgePo={async () => {
          if (!selected) return;
          await acknowledgePo(selected.id);
          toast.success("Procurement stage updated.");
        }}
        onConfirmPayment={async () => {
          if (!selected) return;
          await confirmPayment(selected.id);
          toast.success("Payment received. Order is ready for dispatch.");
        }}
      />

      <Dialog open={Boolean(rejectOpen)} onOpenChange={() => setRejectOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rejectOpen === "pr" ? "Reject purchase request" : "Reject price revision"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || busy}
              onClick={async () => {
                if (!selected) return;
                if (rejectOpen === "pr") {
                  await rejectPr(selected.purchaseRequestId, rejectReason);
                } else {
                  const id = ensureRevisionId(selected);
                  if (id) await rejectPriceRevision(id, rejectReason);
                }
                setRejectOpen(null);
                setRejectReason("");
                toast.success(
                  rejectOpen === "pr"
                    ? "Purchase request rejected."
                    : "Price revision rejected.",
                );
              }}
            >
              Reject
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
          const id = ensureRevisionId(selected);
          if (!id) return;
          await submitCounterOffer(id, {
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
