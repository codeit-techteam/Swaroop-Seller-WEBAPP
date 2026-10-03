"use client";

import { CheckCircle2, Clock, Handshake, Loader2, Repeat2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCanManageImport,
  useImportDeal,
  useImportDeals,
  useImportNegotiation,
  useImportNegotiations,
  useInvalidateImport,
} from "@/hooks/use-import";
import {
  IMPORT_COPY,
  IMPORT_OWN_PARTY,
  IMPORT_ROUTES,
  listingHref,
} from "@/lib/import/config";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatQty,
  importLabel,
  newIdempotencyKey,
  parseImportError,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import {
  acceptNegotiation,
  closeNegotiation,
  confirmDeal,
  counterNegotiation,
} from "@/services/import";
import type { ImportNegotiationEvent } from "@/types/import";

import { ImportDealShipments } from "./import-shipments";
import { ImportTermsDialog } from "./import-terms-dialog";
import {
  ErrorPanel,
  ImportPage,
  ImportStatusBadge,
  KeyValueGrid,
  Pager,
} from "./import-ui";

const partyLabel = (party: string | null, mine: string) =>
  party === mine
    ? "You"
    : party === "SYSTEM" || !party
      ? "System"
      : IMPORT_COPY.counterparty;

// Negotiations -----------------------------------------------------------------

const NEGOTIATION_STATUSES = [
  "OPEN",
  "AGREED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
  "CANCELLED",
];

export function ImportNegotiationsPage({
  initialStatus,
}: {
  initialStatus?: string;
}) {
  const [status, setStatus] = useState<string | undefined>(
    NEGOTIATION_STATUSES.includes(initialStatus ?? "")
      ? initialStatus
      : undefined,
  );
  const [page, setPage] = useState(1);
  const as = IMPORT_OWN_PARTY === "BUYER" ? "buyer" : "seller";
  const list = useImportNegotiations({ status, as, page, limit: 20 });

  return (
    <ImportPage
      title="Negotiations"
      description="Every offer and counteroffer is recorded in order and cannot be edited afterwards."
      breadcrumbs={[{ label: "Negotiations" }]}
    >
      <div className="flex justify-end">
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NEGOTIATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {importLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {list.isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : list.isError ? (
        <ErrorPanel
          message={parseImportError(list.error).message}
          onRetry={() => void list.refetch()}
        />
      ) : !list.data?.items.length ? (
        <p className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No negotiations{" "}
          {status ? `with status “${importLabel(status)}”` : "yet"}.
        </p>
      ) : (
        <div className="space-y-2">
          {list.data.items.map((n) => (
            <Link
              key={n.id}
              href={IMPORT_ROUTES.negotiationDetail(n.id)}
              className="block rounded-2xl border bg-card px-4 py-3.5 shadow-card hover:border-primary/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {n.referenceNumber} · {n.listing?.referenceNumber} ·{" "}
                    {n.counterpartyRef}
                  </p>
                  <p className="truncate font-semibold">
                    {[n.listing?.product, n.listing?.grade]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {n.awaitingMyResponse ? (
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Your turn
                    </span>
                  ) : null}
                  <ImportStatusBadge status={n.status} />
                </div>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                Latest:{" "}
                {n.latestTerms
                  ? `${formatPrice(n.latestTerms.price, n.latestTerms.currencyCode, n.latestTerms.priceUnit)} ${n.latestTerms.incotermCode ?? ""} · ${formatQty(n.latestTerms.quantity, n.latestTerms.quantityUnit)}`
                  : "—"}{" "}
                · Round {n.roundCount}
                {n.status === "OPEN" && n.expiresAt
                  ? ` · Expires ${formatDateTime(n.expiresAt)}`
                  : ""}
              </p>
            </Link>
          ))}
          <Pager
            page={list.data.meta.page}
            totalPages={list.data.meta.totalPages}
            total={list.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
    </ImportPage>
  );
}

function EventTerms({ e }: { e: ImportNegotiationEvent }) {
  if (!e.price && !e.quantity) return null;
  return (
    <div className="mt-2 grid gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
      <span>
        <span className="text-muted-foreground">Price </span>
        {formatPrice(e.price, e.currencyCode, e.priceUnit)}{" "}
        {e.incotermCode ?? ""}
      </span>
      <span>
        <span className="text-muted-foreground">Quantity </span>
        {formatQty(e.quantity, e.quantityUnit)}
      </span>
      {e.paymentTermName ? (
        <span>
          <span className="text-muted-foreground">Payment </span>
          {e.paymentTermName}
        </span>
      ) : null}
      {e.esd ? (
        <span>
          <span className="text-muted-foreground">Shipment </span>
          {formatDate(e.esd)} – {formatDate(e.lsd)}
        </span>
      ) : null}
      {e.inspectionType ? (
        <span>
          <span className="text-muted-foreground">Inspection </span>
          {importLabel(e.inspectionType)}
        </span>
      ) : null}
      {e.otherTerms ? (
        <span className="sm:col-span-2 whitespace-pre-line">
          {e.otherTerms}
        </span>
      ) : null}
    </div>
  );
}

export function ImportNegotiationDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const invalidate = useInvalidateImport();
  const canManage = useCanManageImport();
  const q = useImportNegotiation(id);
  const n = q.data;
  const [counterOpen, setCounterOpen] = useState(false);
  const [closing, setClosing] = useState<"reject" | "withdraw" | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [acceptKey] = useState(() => newIdempotencyKey());

  const latest = n?.latestTerms;
  const defaults = useMemo(
    () => ({
      price: latest?.price,
      quantity: latest?.quantity,
      paymentTermId: latest?.paymentTermId,
      esd: latest?.esd,
      lsd: latest?.lsd,
      inspectionType: latest?.inspectionType,
    }),
    [latest],
  );

  async function accept() {
    if (!n) return;
    setBusy(true);
    try {
      const result = await acceptNegotiation(n.id, acceptKey);
      toast.success("Terms accepted — confirm the deal to finalise it");
      invalidate();
      if (result.deal) router.push(IMPORT_ROUTES.dealDetail(result.deal.id));
    } catch (error) {
      toast.error(parseImportError(error).message);
      void q.refetch();
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!n || !closing) return;
    setBusy(true);
    try {
      await closeNegotiation(n.id, closing, note.trim() || undefined);
      toast.success(
        closing === "reject" ? "Offer rejected" : "Negotiation withdrawn",
      );
      setClosing(null);
      setNote("");
      invalidate();
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(false);
    }
  }

  const can = (a: string) =>
    canManage && n?.allowedActions.includes(a as never);

  return (
    <ImportPage
      title={n?.referenceNumber ?? "Negotiation"}
      breadcrumbs={[
        { label: "Negotiations", href: IMPORT_ROUTES.negotiations },
        { label: n?.referenceNumber ?? "Detail" },
      ]}
      actions={
        n ? (
          <>
            {can("ACCEPT") ? (
              <Button onClick={() => void accept()} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}{" "}
                Accept terms
              </Button>
            ) : null}
            {can("COUNTER") ? (
              <Button variant="outline" onClick={() => setCounterOpen(true)}>
                <Repeat2 /> Counter
              </Button>
            ) : null}
            {can("REJECT") ? (
              <Button variant="outline" onClick={() => setClosing("reject")}>
                Reject
              </Button>
            ) : null}
            {can("WITHDRAW") ? (
              <Button variant="ghost" onClick={() => setClosing("withdraw")}>
                Withdraw
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : q.isError || !n ? (
        <ErrorPanel
          message={parseImportError(q.error).message}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {n.status === "OPEN" ? (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm",
                  n.awaitingMyResponse
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                <Clock className="h-4 w-4 shrink-0" />
                {n.awaitingMyResponse
                  ? `Your response is due${n.expiresAt ? ` by ${formatDateTime(n.expiresAt)}` : ""}.`
                  : `Waiting for the ${IMPORT_COPY.counterparty.toLowerCase()} to respond${n.expiresAt ? ` (expires ${formatDateTime(n.expiresAt)})` : ""}.`}
              </div>
            ) : null}
            {n.deal ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <span className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" /> Deal{" "}
                  {n.deal.referenceNumber} · {importLabel(n.deal.status)}
                </span>
                <Button size="sm" variant="outline" asChild>
                  <Link href={IMPORT_ROUTES.dealDetail(n.deal.id)}>
                    View deal
                  </Link>
                </Button>
              </div>
            ) : null}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                  {n.events.map((e) => {
                    const mine = e.actorParty === n.myParty;
                    return (
                      <li key={e.id} className="relative">
                        <span
                          className={cn(
                            "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white",
                            e.type === "ACCEPTED"
                              ? "bg-emerald-500"
                              : e.type === "REJECTED" ||
                                  e.type === "WITHDRAWN" ||
                                  e.type === "EXPIRED"
                                ? "bg-slate-400"
                                : mine
                                  ? "bg-primary"
                                  : "bg-amber-500",
                          )}
                        />
                        <p className="text-sm font-semibold">
                          {importLabel(e.type)} ·{" "}
                          {partyLabel(e.actorParty, n.myParty)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{e.sequence} · {formatDateTime(e.createdAt)}
                        </p>
                        <EventTerms e={e} />
                        {e.note ? (
                          <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            {e.note}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <ImportStatusBadge status={n.status} />
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {IMPORT_COPY.counterparty}
                  </span>
                  <span className="font-mono">{n.counterpartyRef}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Rounds</span>
                  <span>{n.roundCount}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Fixed terms</span>
                  <span className="text-right">
                    {n.fixedTerms.currencyCode} /{" "}
                    {importLabel(n.fixedTerms.priceUnit)} ·{" "}
                    {n.fixedTerms.incoterm ?? "—"}
                    {n.fixedTerms.priceBasis
                      ? ` ${n.fixedTerms.priceBasis}`
                      : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
            {[n.buyListing, n.sellListing].map((l) =>
              l ? (
                <Card key={l.id}>
                  <CardContent className="space-y-1 p-4 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {l.side === "BUY" ? "Buy request" : "Sell offer"}
                    </p>
                    <Link
                      href={listingHref(l.side, l.id)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {l.referenceNumber}
                    </Link>
                    <p className="text-slate-600">
                      {[l.product, l.grade, l.brand]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-slate-600">
                      {formatQty(l.quantity, l.quantityUnit)} ·{" "}
                      {formatPrice(l.price, l.currencyCode, l.priceUnit)}{" "}
                      {l.incoterm ?? ""}
                    </p>
                    <p className="text-slate-600">
                      {l.pol?.code ?? "—"} → {l.pod?.code ?? "—"}
                    </p>
                  </CardContent>
                </Card>
              ) : null,
            )}
          </div>
        </div>
      )}

      {n ? (
        <ImportTermsDialog
          open={counterOpen}
          onOpenChange={setCounterOpen}
          title="Send a counteroffer"
          description="Edit the terms you want to change. Unchanged terms carry over from the last round."
          submitLabel="Send counteroffer"
          fixed={n.fixedTerms}
          defaults={defaults}
          onSubmit={async (terms, key) => {
            await counterNegotiation(n.id, terms, key);
            toast.success("Counteroffer sent");
            invalidate();
          }}
        />
      ) : null}

      <Dialog
        open={closing !== null}
        onOpenChange={(o) => !o && setClosing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {closing === "reject"
                ? "Reject this offer?"
                : "Withdraw from this negotiation?"}
            </DialogTitle>
            <DialogDescription>
              The negotiation closes permanently. You can start a new one while
              the listing is live.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            maxLength={2000}
            placeholder="Message (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosing(null)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => void close()}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : null}
              {closing === "reject" ? "Reject" : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ImportPage>
  );
}

// Deals ----------------------------------------------------------------------

const DEAL_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
];

export function ImportDealsPage({ initialStatus }: { initialStatus?: string }) {
  const [status, setStatus] = useState<string | undefined>(
    DEAL_STATUSES.includes(initialStatus ?? "") ? initialStatus : undefined,
  );
  const [page, setPage] = useState(1);
  const as = IMPORT_OWN_PARTY === "BUYER" ? "buyer" : "seller";
  const list = useImportDeals({ status, as, page, limit: 20 });

  return (
    <ImportPage
      title="Deals"
      description="Agreed terms become a deal once both parties confirm. Identities are shared after confirmation."
      breadcrumbs={[{ label: "Deals" }]}
    >
      <div className="flex justify-end">
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {DEAL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {importLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {list.isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : list.isError ? (
        <ErrorPanel
          message={parseImportError(list.error).message}
          onRetry={() => void list.refetch()}
        />
      ) : !list.data?.items.length ? (
        <p className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No deals yet.
        </p>
      ) : (
        <div className="space-y-2">
          {list.data.items.map((d) => (
            <Link
              key={d.id}
              href={IMPORT_ROUTES.dealDetail(d.id)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-card hover:border-primary/40"
            >
              <div>
                <p className="font-semibold">{d.referenceNumber}</p>
                <p className="text-sm text-slate-600">
                  {formatQty(d.quantity, d.quantityUnit)} ·{" "}
                  {formatPrice(d.price, d.currencyCode, d.priceUnit)}{" "}
                  {d.incotermCode ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {d.awaitingMyConfirmation ? (
                  <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Confirm now
                  </span>
                ) : null}
                <ImportStatusBadge status={d.status} />
              </div>
            </Link>
          ))}
          <Pager
            page={list.data.meta.page}
            totalPages={list.data.meta.totalPages}
            total={list.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
    </ImportPage>
  );
}

export function ImportDealDetailPage({ id }: { id: string }) {
  const invalidate = useInvalidateImport();
  const canManage = useCanManageImport();
  const q = useImportDeal(id);
  const d = q.data;
  const [busy, setBusy] = useState(false);
  const [key] = useState(() => newIdempotencyKey());

  async function confirm() {
    if (!d) return;
    setBusy(true);
    try {
      const result = await confirmDeal(d.id, key);
      toast.success(
        result.status === "CONFIRMED"
          ? "Deal confirmed by both parties"
          : "Your confirmation is recorded",
      );
      invalidate();
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(false);
    }
  }

  const counterparty = d
    ? d.myParty === "BUYER"
      ? d.seller
      : d.buyer
    : undefined;
  const counterpartyRef = d
    ? d.myParty === "BUYER"
      ? d.sellerRef
      : d.buyerRef
    : "";

  return (
    <ImportPage
      title={d?.referenceNumber ?? "Deal"}
      breadcrumbs={[
        { label: "Deals", href: IMPORT_ROUTES.deals },
        { label: d?.referenceNumber ?? "Detail" },
      ]}
      actions={
        canManage && d?.awaitingMyConfirmation ? (
          <Button onClick={() => void confirm()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}{" "}
            Confirm deal
          </Button>
        ) : null
      }
    >
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : q.isError || !d ? (
        <ErrorPanel
          message={parseImportError(q.error).message}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Negotiation{" "}
                  <Link
                    href={IMPORT_ROUTES.negotiationDetail(d.negotiation.id)}
                    className="text-primary hover:underline"
                  >
                    {d.negotiation.referenceNumber}
                  </Link>
                </p>
                <p className="mt-0.5 text-xl font-semibold">
                  {formatQty(d.quantity, d.quantityUnit)} at{" "}
                  {formatPrice(d.price, d.currencyCode, d.priceUnit)}{" "}
                  {d.incotermCode ?? ""}
                </p>
              </div>
              <ImportStatusBadge status={d.status} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agreed terms</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValueGrid
                items={[
                  {
                    label: "Price",
                    value: formatPrice(d.price, d.currencyCode, d.priceUnit),
                  },
                  {
                    label: "Quantity",
                    value: formatQty(d.quantity, d.quantityUnit),
                  },
                  {
                    label: "Incoterm",
                    value: [d.incotermCode, d.priceBasisLocation]
                      .filter(Boolean)
                      .join(" "),
                  },
                  { label: "Payment terms", value: d.paymentTermName },
                  {
                    label: "Shipment window",
                    value: d.esd
                      ? `${formatDate(d.esd)} – ${formatDate(d.lsd)}`
                      : null,
                  },
                  {
                    label: IMPORT_COPY.counterparty,
                    value: counterparty ? (
                      counterparty.name
                    ) : (
                      <span className="font-mono">{counterpartyRef}</span>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Confirmations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(["BUYER", "SELLER"] as const).map((party) => {
                const at =
                  party === "BUYER" ? d.buyerConfirmedAt : d.sellerConfirmedAt;
                return (
                  <div
                    key={party}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                  >
                    {at ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {party === d.myParty ? "You" : IMPORT_COPY.counterparty}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {at
                          ? `Confirmed ${formatDateTime(at)}`
                          : "Awaiting confirmation"}
                      </p>
                    </div>
                  </div>
                );
              })}
              {d.status === "PENDING_CONFIRMATION" ? (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Company names are shared with both parties once both
                  confirmations are recorded.
                </p>
              ) : null}
            </CardContent>
          </Card>
          <ImportDealShipments deal={d} canManage={canManage} />
        </div>
      )}
    </ImportPage>
  );
}
