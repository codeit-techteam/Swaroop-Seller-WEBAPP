"use client";

import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Pencil,
  XCircle,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCanManageImport,
  useImportListing,
  useImportMatches,
  useImportNegotiations,
  useInvalidateImport,
} from "@/hooks/use-import";
import {
  IMPORT_COPY,
  IMPORT_MARKET_SIDE,
  IMPORT_OWN_SIDE,
  IMPORT_ROUTES,
} from "@/lib/import/config";
import {
  formatDateTime,
  formatPrice,
  formatQty,
  importLabel,
  listingTitle,
  OPEN_STATUSES,
  parseImportError,
  portLabel,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import {
  deleteListing,
  dismissMatch,
  openNegotiation,
  transitionListing,
} from "@/services/import";
import type { ImportListing, ImportMatch } from "@/types/import";

import { ImportDocumentsCard } from "./import-documents-card";
import { ImportListingDetails } from "./import-listing-details";
import { ImportListingForm } from "./import-listing-form";
import { ImportTermsDialog } from "./import-terms-dialog";
import {
  ErrorPanel,
  ImportPage,
  ImportStatusBadge,
  ImportValidity,
} from "./import-ui";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function ListingHeader({
  listing,
  fetchedAt,
}: {
  listing: ImportListing;
  fetchedAt: number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {listing.referenceNumber ?? "Draft"}
            {listing.viewerRole === "COUNTERPARTY"
              ? ` · ${listing.counterpartyRef}`
              : ""}
          </p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight">
            {listingTitle(listing)}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {formatQty(listing.product.quantity, listing.product.quantityUnit)}{" "}
            ·{" "}
            {formatPrice(
              listing.commercial.price,
              listing.commercial.currencyCode,
              listing.commercial.priceUnit,
            )}{" "}
            {listing.commercial.incoterm?.code ?? ""} ·{" "}
            {portLabel(listing.shipping.pol)} →{" "}
            {portLabel(listing.shipping.pod)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ImportStatusBadge status={listing.status} />
          {listing.status !== "DRAFT" ? (
            <ImportValidity
              validUntil={listing.validity.validUntil}
              secondsRemaining={listing.validity.secondsRemaining}
              fetchedAt={fetchedAt}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// Create / edit ---------------------------------------------------------------

function ManageRequired() {
  return (
    <p className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      Creating and editing {IMPORT_COPY.ownPlural.toLowerCase()} needs Import
      Trading manage access.
    </p>
  );
}

export function ImportCreatePage() {
  const canManage = useCanManageImport();
  return (
    <ImportPage
      title={`New ${IMPORT_COPY.own.toLowerCase()}`}
      description="Your draft saves automatically as you type. Publish when every required field is complete."
      breadcrumbs={[
        {
          label: `My ${IMPORT_COPY.ownPlural.toLowerCase()}`,
          href: IMPORT_ROUTES.mine,
        },
        { label: "New" },
      ]}
    >
      {canManage ? (
        <ImportListingForm side={IMPORT_OWN_SIDE} />
      ) : (
        <ManageRequired />
      )}
    </ImportPage>
  );
}

export function ImportEditPage({ id }: { id: string }) {
  const canManage = useCanManageImport();
  const listing = useImportListing(IMPORT_OWN_SIDE, canManage ? id : null);
  const l = listing.data;
  return (
    <ImportPage
      title={
        l?.status === "DRAFT" || !l
          ? `Edit draft`
          : `Edit ${l.referenceNumber ?? ""}`
      }
      breadcrumbs={[
        {
          label: `My ${IMPORT_COPY.ownPlural.toLowerCase()}`,
          href: IMPORT_ROUTES.mine,
        },
        {
          label: l?.referenceNumber ?? "Draft",
          href:
            l && l.status !== "DRAFT"
              ? IMPORT_ROUTES.mineDetail(id)
              : undefined,
        },
        { label: "Edit" },
      ]}
    >
      {!canManage ? (
        <ManageRequired />
      ) : listing.isLoading ? (
        <DetailSkeleton />
      ) : listing.isError || !l ? (
        <ErrorPanel
          message={parseImportError(listing.error).message}
          onRetry={() => void listing.refetch()}
        />
      ) : l.viewerRole !== "OWNER" ||
        ![...OPEN_STATUSES, "DRAFT", "PAUSED"].includes(l.status) ? (
        <ErrorPanel message="This listing can no longer be edited." />
      ) : (
        <ImportListingForm key={l.id} side={IMPORT_OWN_SIDE} initial={l} />
      )}
    </ImportPage>
  );
}

// Owner detail ----------------------------------------------------------------

export function ImportOwnerDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const invalidate = useInvalidateImport();
  const canManage = useCanManageImport();
  const listing = useImportListing(IMPORT_OWN_SIDE, id);
  const l = listing.data;
  const live = Boolean(l && OPEN_STATUSES.includes(l.status));
  const matches = useImportMatches(
    IMPORT_OWN_SIDE,
    id,
    Boolean(l && l.status !== "DRAFT"),
  );
  const negotiations = useImportNegotiations({ listingId: id, limit: 50 });
  const [tab, setTab] = useState<
    "details" | "matches" | "negotiations" | "documents"
  >("matches");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(
    action: "cancel" | "expire" | "pause" | "resume" | "delete",
  ) {
    if (!l) return;
    setBusy(action);
    try {
      if (action === "delete") {
        await deleteListing(IMPORT_OWN_SIDE, l.id);
        toast.success("Draft deleted");
        invalidate();
        router.push(IMPORT_ROUTES.mine);
        return;
      }
      await transitionListing(
        IMPORT_OWN_SIDE,
        l.id,
        action,
        reason || undefined,
      );
      toast.success(
        action === "cancel"
          ? "Listing cancelled"
          : action === "expire"
            ? "Listing closed"
            : action === "pause"
              ? "Listing paused"
              : "Listing resumed",
      );
      setCancelOpen(false);
      invalidate();
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(null);
    }
  }

  const can = (s: string) =>
    canManage && l?.allowedTransitions?.includes(s as never);
  const editable =
    canManage &&
    l &&
    ([...OPEN_STATUSES, "DRAFT", "PAUSED"] as string[]).includes(l.status);

  return (
    <ImportPage
      title={l?.referenceNumber ?? IMPORT_COPY.own}
      breadcrumbs={[
        {
          label: `My ${IMPORT_COPY.ownPlural.toLowerCase()}`,
          href: IMPORT_ROUTES.mine,
        },
        { label: l?.referenceNumber ?? "Detail" },
      ]}
      actions={
        l ? (
          <>
            {editable ? (
              <Button asChild variant="outline">
                <Link href={IMPORT_ROUTES.edit(l.id)}>
                  <Pencil /> {l.status === "DRAFT" ? "Continue draft" : "Edit"}
                </Link>
              </Button>
            ) : null}
            {canManage && l.status === "DRAFT" ? (
              <Button
                variant="outline"
                onClick={() => void run("delete")}
                disabled={busy === "delete"}
              >
                Delete draft
              </Button>
            ) : null}
            {IMPORT_OWN_SIDE === "SELL" && can("PAUSED") ? (
              <Button
                variant="outline"
                onClick={() => void run("pause")}
                disabled={!!busy}
              >
                Pause
              </Button>
            ) : null}
            {canManage &&
            IMPORT_OWN_SIDE === "SELL" &&
            l.status === "PAUSED" ? (
              <Button
                variant="outline"
                onClick={() => void run("resume")}
                disabled={!!busy}
              >
                Resume
              </Button>
            ) : null}
            {live && can("EXPIRED") ? (
              <Button
                variant="outline"
                onClick={() => void run("expire")}
                disabled={!!busy}
              >
                Close now
              </Button>
            ) : null}
            {l.status !== "DRAFT" && can("CANCELLED") ? (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancel
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {listing.isLoading ? (
        <DetailSkeleton />
      ) : listing.isError || !l ? (
        <ErrorPanel
          message={parseImportError(listing.error).message}
          onRetry={() => void listing.refetch()}
        />
      ) : (
        <>
          <ListingHeader listing={l} fetchedAt={listing.dataUpdatedAt} />
          {l.status === "CANCELLED" && l.cancelReason ? (
            <p className="text-sm text-muted-foreground">
              Cancellation reason: {l.cancelReason}
            </p>
          ) : null}

          <div className="flex gap-1 overflow-x-auto border-b">
            {(
              [
                [
                  "matches",
                  `Matches${matches.data ? ` (${matches.data.length})` : ""}`,
                ],
                [
                  "negotiations",
                  `Negotiations${negotiations.data ? ` (${negotiations.data.meta.total})` : ""}`,
                ],
                ["details", "Details"],
                ["documents", "Attachments"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
                  tab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "details" ? <ImportListingDetails listing={l} /> : null}
          {tab === "documents" ? (
            <ImportDocumentsCard
              listingId={l.id}
              canManage={editable === true}
            />
          ) : null}
          {tab === "negotiations" ? (
            negotiations.isLoading ? (
              <DetailSkeleton />
            ) : !negotiations.data?.items.length ? (
              <p className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                No offers yet. Counterparties can respond while the listing is
                live.
              </p>
            ) : (
              <div className="space-y-2">
                {negotiations.data.items.map((n) => (
                  <Link
                    key={n.id}
                    href={IMPORT_ROUTES.negotiationDetail(n.id)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 hover:border-primary/40"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {n.referenceNumber} · {n.counterpartyRef}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {n.latestTerms
                          ? `${formatPrice(n.latestTerms.price, n.latestTerms.currencyCode, n.latestTerms.priceUnit)} · ${formatQty(n.latestTerms.quantity, n.latestTerms.quantityUnit)}`
                          : "—"}{" "}
                        · Round {n.roundCount} · Updated{" "}
                        {formatDateTime(n.updatedAt)}
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
                  </Link>
                ))}
              </div>
            )
          ) : null}
          {tab === "matches" ? (
            <MatchesPanel
              listing={l}
              matches={matches.data}
              loading={matches.isLoading}
              canManage={canManage}
              onDismiss={async (matchId) => {
                try {
                  await dismissMatch(IMPORT_OWN_SIDE, l.id, matchId);
                  await matches.refetch();
                } catch (error) {
                  toast.error(parseImportError(error).message);
                }
              }}
            />
          ) : null}
        </>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cancel this {IMPORT_COPY.own.toLowerCase()}?
            </DialogTitle>
            <DialogDescription>
              Open negotiations are closed and counterparties are notified. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            maxLength={500}
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep listing
            </Button>
            <Button
              variant="destructive"
              onClick={() => void run("cancel")}
              disabled={busy === "cancel"}
            >
              {busy === "cancel" ? <Loader2 className="animate-spin" /> : null}
              Cancel listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ImportPage>
  );
}

function MatchesPanel({
  listing,
  matches,
  loading,
  canManage,
  onDismiss,
}: {
  listing: ImportListing;
  matches?: ImportMatch[];
  loading: boolean;
  canManage: boolean;
  onDismiss: (matchId: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (listing.status === "DRAFT") {
    return (
      <p className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        Matches are calculated after you publish.
      </p>
    );
  }
  if (loading) return <DetailSkeleton />;
  if (!matches?.length) {
    return (
      <p className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        No matching {IMPORT_COPY.marketPlural.toLowerCase()} yet. Matches are
        recalculated whenever new offers are published.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Scores come from fixed, Admin-configured criteria weights. Prices are
        compared only when currency, Incoterm and basis location are identical.
      </p>
      {matches.map((m) => (
        <Card key={m.id} className={cn(m.status === "STALE" && "opacity-60")}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {m.listing.referenceNumber} · {m.listing.counterpartyRef}
                </p>
                <p className="truncate font-semibold">
                  {listingTitle(m.listing)}
                </p>
                <p className="text-sm text-slate-600">
                  {formatQty(
                    m.listing.product.quantity,
                    m.listing.product.quantityUnit,
                  )}{" "}
                  ·{" "}
                  {formatPrice(
                    m.listing.commercial.price,
                    m.listing.commercial.currencyCode,
                    m.listing.commercial.priceUnit,
                  )}{" "}
                  {m.listing.commercial.incoterm?.code ?? ""} ·{" "}
                  {m.listing.shipping.pol?.code ?? "—"} →{" "}
                  {m.listing.shipping.pod?.code ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-2xl font-semibold",
                    m.matchScore >= 80
                      ? "text-emerald-700"
                      : m.matchScore >= 60
                        ? "text-amber-700"
                        : "text-slate-600",
                  )}
                >
                  {m.matchScore.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {importLabel(m.status)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.matchedCriteria.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3" /> {importLabel(c)}
                </span>
              ))}
              {m.unmatchedCriteria.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  <XCircle className="h-3 w-3" /> {importLabel(c)}
                </span>
              ))}
            </div>
            {expanded === m.id ? (
              <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                {m.evidence.map((e) => (
                  <li key={e.criterion} className="flex justify-between gap-3">
                    <span>
                      {e.matched ? "✓" : "✗"} {importLabel(e.criterion)} —{" "}
                      {e.reason}
                    </span>
                    <span className="text-muted-foreground">
                      weight {e.weight.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link
                  href={`${IMPORT_ROUTES.marketDetail(m.listing.id)}?from=${listing.id}`}
                >
                  <MessageSquare /> View & respond
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                {expanded === m.id ? "Hide scoring" : "Why this score"}
              </Button>
              {canManage && m.status === "SUGGESTED" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void onDismiss(m.id)}
                >
                  Dismiss
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Counterparty (market) detail -------------------------------------------------

export function ImportMarketDetailPage({
  id,
  counterListingId,
}: {
  id: string;
  counterListingId?: string;
}) {
  const router = useRouter();
  const invalidate = useInvalidateImport();
  const canManage = useCanManageImport();
  const listing = useImportListing(IMPORT_MARKET_SIDE, id);
  const l = listing.data;
  const [offerOpen, setOfferOpen] = useState(false);
  const open = Boolean(
    canManage && l && OPEN_STATUSES.includes(l.status) && !l.validity.isExpired,
  );
  const existing = l?.myNegotiation;

  const defaults = useMemo(
    () => ({
      price: l?.commercial.price,
      quantity: l?.product.quantity,
      paymentTermId: l?.commercial.paymentTermId,
      esd: l?.shipping.esd,
      lsd: l?.shipping.lsd,
      inspectionType: l?.quality.inspectionType,
    }),
    [l],
  );

  return (
    <ImportPage
      title={l?.referenceNumber ?? IMPORT_COPY.market}
      breadcrumbs={[
        { label: IMPORT_COPY.marketPlural, href: IMPORT_ROUTES.market },
        { label: l?.referenceNumber ?? "Detail" },
      ]}
      actions={
        l ? (
          existing && existing.status === "OPEN" ? (
            <Button asChild>
              <Link href={IMPORT_ROUTES.negotiationDetail(existing.id)}>
                <MessageSquare /> Open negotiation {existing.referenceNumber}
              </Link>
            </Button>
          ) : open ? (
            <Button onClick={() => setOfferOpen(true)}>
              <MessageSquare /> Make an offer
            </Button>
          ) : null
        ) : null
      }
    >
      {listing.isLoading ? (
        <DetailSkeleton />
      ) : listing.isError || !l ? (
        <ErrorPanel
          message={
            parseImportError(listing.error).code === "IMPORT_NOT_FOUND"
              ? `This ${IMPORT_COPY.market.toLowerCase()} is no longer available.`
              : parseImportError(listing.error).message
          }
        />
      ) : (
        <>
          <ListingHeader listing={l} fetchedAt={listing.dataUpdatedAt} />
          {existing && existing.status !== "OPEN" ? (
            <p className="text-sm text-muted-foreground">
              Your previous negotiation{" "}
              <Link
                className="text-primary underline-offset-2 hover:underline"
                href={IMPORT_ROUTES.negotiationDetail(existing.id)}
              >
                {existing.referenceNumber}
              </Link>{" "}
              is {importLabel(existing.status).toLowerCase()}.
            </p>
          ) : null}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <ImportListingDetails listing={l} />
            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {IMPORT_COPY.counterparty}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p className="font-mono text-foreground">
                    {l.counterpartyRef}
                  </p>
                  <p>
                    Verified counterparty. The company name is shared once both
                    sides confirm a deal.
                  </p>
                </CardContent>
              </Card>
              {existing ? (
                <ImportDocumentsCard listingId={l.id} canManage={false} />
              ) : null}
            </div>
          </div>
        </>
      )}

      {l ? (
        <ImportTermsDialog
          open={offerOpen}
          onOpenChange={setOfferOpen}
          title={`Make an offer on ${l.referenceNumber ?? ""}`}
          description={`The ${IMPORT_COPY.counterparty.toLowerCase()} can accept, reject or counter. Offers expire automatically if not answered.`}
          submitLabel="Send offer"
          fixed={{
            currencyCode: l.commercial.currencyCode,
            priceUnit: l.commercial.priceUnit,
            quantityUnit: l.product.quantityUnit,
            incoterm: l.commercial.incoterm?.code ?? null,
            priceBasis: l.commercial.priceBasisPort
              ? portLabel(l.commercial.priceBasisPort)
              : l.commercial.priceBasisLocation,
          }}
          defaults={defaults}
          onSubmit={async (terms, key) => {
            const result = await openNegotiation(
              {
                ...terms,
                listingId: l.id,
                counterListingId,
                price: terms.price!,
                quantity: terms.quantity!,
              },
              key,
            );
            toast.success(`Offer sent · ${result.referenceNumber}`);
            invalidate();
            router.push(IMPORT_ROUTES.negotiationDetail(result.id));
          }}
        />
      ) : null}
    </ImportPage>
  );
}
