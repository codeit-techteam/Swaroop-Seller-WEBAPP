"use client";

import { ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { RequestsPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { ROUTES } from "@/lib/constants";
import { formatMt, formatPricePerKg } from "@/lib/seller/format";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useSellerRequestStore } from "@/store/sellerRequestStore";
import { useSellerStore } from "@/store/sellerStore";

/** Poll inbox so newly matched PRs appear during the 15-minute response window. */
const INBOX_POLL_MS = 15_000;

const REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "counter_sent", label: "Counter Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
] as const;

const REJECT_REASONS = [
  "Inventory Unavailable",
  "Price Not Acceptable",
  "MOQ Too Low",
  "Warehouse Issue",
  "Unable to fulfil within requested window",
  "Other",
] as const;

function formatRemaining(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function canRespond(status: string, allowedActions?: string[]) {
  if (allowedActions?.length) {
    return allowedActions.some((action) =>
      ["ACCEPT", "REJECT", "COUNTER", "COUNTER_OFFER"].includes(action),
    );
  }
  return status === "new" || status === "under_review";
}

export function SellerRequestsView() {
  const requests = useSellerRequestStore((s) => s.requests);
  const loading = useSellerRequestStore((s) => s.loading);
  const loadError = useSellerRequestStore((s) => s.loadError);
  const hydrate = useSellerRequestStore((s) => s.hydrate);
  const search = useSellerRequestStore((s) => s.search);
  const setSearch = useSellerRequestStore((s) => s.setSearch);
  const status = useSellerRequestStore((s) => s.status);
  const setStatus = useSellerRequestStore((s) => s.setStatus);
  const selectedId = useSellerRequestStore((s) => s.selectedId);
  const drawerOpen = useSellerRequestStore((s) => s.drawerOpen);
  const openDrawer = useSellerRequestStore((s) => s.openDrawer);
  const closeDrawer = useSellerRequestStore((s) => s.closeDrawer);
  const accept = useSellerRequestStore((s) => s.accept);
  const reject = useSellerRequestStore((s) => s.reject);
  const counter = useSellerRequestStore((s) => s.counter);
  const actionPending = useSellerRequestStore((s) => s.actionPending);
  const addActivity = useSellerStore((s) => s.addActivity);
  const [counterOpen, setCounterOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<
    (typeof REJECT_REASONS)[number]
  >("Inventory Unavailable");
  const [rejectRemark, setRejectRemark] = useState("");
  const [price, setPrice] = useState("0");
  const [qty, setQty] = useState("0");
  const [validity, setValidity] = useState("24 hours");
  const [remark, setRemark] = useState("");
  const [nowTick, setNowTick] = useState(() => Date.now());

  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Wait for auth rehydration so the first poll always carries a Bearer token.
    // Access JWTs expire in 15m; apiClient refreshes on 401 via refresh token.
    if (!authHydrated || !isAuthenticated) return;
    void hydrate();
    const poll = setInterval(() => {
      void hydrate();
    }, INBOX_POLL_MS);
    return () => clearInterval(poll);
  }, [hydrate, authHydrated, isAuthenticated]);

  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!query) return true;
      return (
        item.requestNumber.toLowerCase().includes(query) ||
        item.gradeName.toLowerCase().includes(query)
      );
    });
  }, [requests, search, status]);

  const selected = requests.find((item) => item.id === selectedId);

  const remainingFor = (item: (typeof requests)[number]) => {
    if (item.responseDeadline) {
      const ms = new Date(item.responseDeadline).getTime() - nowTick;
      return Math.max(0, Math.floor(ms / 1000));
    }
    return item.remainingSeconds ?? null;
  };

  if (loading && requests.length === 0) {
    return <RequestsPageSkeleton />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Requests"
        description="Incoming buyer requests matched to your grades. Respond within 15 minutes. Identity stays limited until the deal progresses."
      />
      {loadError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => void hydrate()}
          >
            Retry
          </button>
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search request or grade"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_STATUS_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No purchase requests"
          description="When a buyer requests a grade you sell, it appears here within the 15-minute sourcing window."
          action={
            <Button asChild>
              <Link href={ROUTES.OFFERS}>Browse My Offers</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Requested price</th>
                <th className="px-4 py-3">Received</th>
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const remaining = remainingFor(item);
                const clock = formatRemaining(remaining);
                return (
                  <tr key={item.id} className="border-t hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">
                      <div>{item.requestNumber}</div>
                      {clock &&
                      (item.status === "new" ||
                        item.status === "under_review") ? (
                        <div className="text-xs text-amber-600">
                          Respond in {clock}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{item.gradeName}</td>
                    <td className="px-4 py-3">{formatMt(item.quantityMt)}</td>
                    <td className="px-4 py-3">
                      <div>Anonymous Buyer</div>
                    </td>
                    <td className="px-4 py-3">{item.deliveryLocation}</td>
                    <td className="px-4 py-3">
                      {formatPricePerKg(item.requestedPrice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {formatDateTime(item.receivedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <SellerStatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => openDrawer(item.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(open) => !open && closeDrawer()}
        title={selected?.requestNumber ?? "Request"}
        footer={
          selected && canRespond(selected.status, selected.allowedActions) ? (
            <div className="flex flex-nowrap gap-2">
              <Button
                className="flex-1 whitespace-nowrap"
                disabled={actionPending}
                onClick={() => {
                  void (async () => {
                    try {
                      await accept(selected.id);
                      addActivity({
                        type: "request",
                        title: "Purchase request accepted",
                        description: selected.requestNumber,
                      });
                      toast.success("Purchase request accepted");
                      closeDrawer();
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to accept request",
                      );
                    }
                  })();
                }}
              >
                {actionPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Accept
              </Button>
              <Button
                className="flex-1 whitespace-nowrap"
                variant="outline"
                disabled={actionPending}
                onClick={() => {
                  setPrice(String(selected.requestedPrice));
                  setQty(String(selected.quantityMt));
                  setCounterOpen(true);
                }}
              >
                Negotiate
              </Button>
              <Button
                className="flex-1 whitespace-nowrap"
                variant="destructive"
                disabled={actionPending}
                onClick={() => {
                  setRejectReason("Inventory Unavailable");
                  setRejectRemark("");
                  setRejectOpen(true);
                }}
              >
                Reject
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <dl className="space-y-3 text-sm">
            <Row label="Grade" value={selected.gradeName} />
            <Row label="Quantity" value={formatMt(selected.quantityMt)} />
            <Row
              label="Requested price"
              value={formatPricePerKg(selected.requestedPrice)}
            />
            <Row label="Delivery" value={selected.deliveryLocation} />
            <Row label="Delivery date" value={selected.requestedDeliveryDate} />
            <Row label="Payment terms" value={selected.paymentTerms} />
            <Row label="Buyer" value="Anonymous Buyer" />
            <Row
              label="Response window"
              value={
                formatRemaining(remainingFor(selected)) ??
                (selected.responseDeadline
                  ? formatDateTime(selected.responseDeadline)
                  : "—")
              }
            />
            <Row label="Notes" value={selected.notes || "—"} />
            <Row label="Status" value={selected.status} />
          </dl>
        ) : null}
      </DetailDrawer>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject purchase request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select
                value={rejectReason}
                onValueChange={(value) =>
                  setRejectReason(value as (typeof REJECT_REASONS)[number])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REJECT_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remark (optional)</Label>
              <Input
                className="mt-1"
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Additional context for the buyer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionPending}
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionPending || !selected}
              onClick={() => {
                if (!selected || actionPending) return;
                void (async () => {
                  try {
                    await reject(selected.id, {
                      rejectionReason: rejectReason,
                      message: rejectRemark.trim() || undefined,
                    });
                    toast.success("Request rejected");
                    setRejectOpen(false);
                    closeDrawer();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to reject request",
                    );
                  }
                })();
              }}
            >
              {actionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting…
                </>
              ) : (
                "Confirm reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negotiate / Counter offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Your Price</Label>
              <Input
                className="mt-1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                className="mt-1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <Label>Validity</Label>
              <Input
                className="mt-1"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              />
            </div>
            <div>
              <Label>Remark</Label>
              <Input
                className="mt-1"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={actionPending || !selected}
              onClick={() => {
                if (!selected || actionPending) return;
                void (async () => {
                  try {
                    await counter(selected.id, {
                      price: Number(price),
                      quantity: Number(qty),
                      validity,
                      remark,
                    });
                    toast.success("Counter offer sent");
                    setCounterOpen(false);
                    closeDrawer();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to send counter offer",
                    );
                  }
                })();
              }}
            >
              {actionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send counter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
