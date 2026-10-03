"use client";

import {
  FilePlus2,
  Handshake,
  Inbox,
  PackageSearch,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCanManageImport,
  useImportListings,
  useImportMaster,
  useImportSummary,
} from "@/hooks/use-import";
import { useDebounce } from "@/hooks/useDebounce";
import {
  IMPORT_COPY,
  IMPORT_MARKET_SIDE,
  IMPORT_OWN_SIDE,
  IMPORT_ROUTES,
} from "@/lib/import/config";
import {
  DECIMAL_PRICE,
  parseImportError,
  portLabel,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import {
  fetchImportPorts,
  fetchImportProducts,
  type ListingQuery,
} from "@/services/import";

import { ImportListingRow } from "./import-listing-details";
import {
  ErrorPanel,
  Field,
  ImportPage,
  Pager,
  SearchSelect,
} from "./import-ui";

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[92px] rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyList({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const CreateButton = () => (
  <Button asChild>
    <Link href={IMPORT_ROUTES.create}>
      <FilePlus2 /> New {IMPORT_COPY.own.toLowerCase()}
    </Link>
  </Button>
);

// Overview -------------------------------------------------------------------

export function ImportOverviewPage() {
  const summary = useImportSummary();
  const canManage = useCanManageImport();
  const mine =
    IMPORT_OWN_SIDE === "BUY" ? summary.data?.buy : summary.data?.sell;
  const count = (statuses: string[]) =>
    statuses.reduce((sum, s) => sum + (mine?.listings[s] ?? 0), 0);

  const tiles = [
    {
      label: "Drafts",
      value: count(["DRAFT"]),
      href: `${IMPORT_ROUTES.mine}?tab=draft`,
    },
    {
      label: `Live ${IMPORT_COPY.ownPlural.toLowerCase()}`,
      value: count([
        "PUBLISHED",
        "MATCHING",
        "OFFER_RECEIVED",
        "NEGOTIATION",
        "PAUSED",
      ]),
      href: `${IMPORT_ROUTES.mine}?tab=live`,
    },
    {
      label: "Open negotiations",
      value: mine?.openNegotiations ?? 0,
      href: `${IMPORT_ROUTES.negotiations}?status=OPEN`,
    },
    {
      label: "Deals awaiting confirmation",
      value: mine?.pendingDeals ?? 0,
      href: `${IMPORT_ROUTES.deals}?status=PENDING_CONFIRMATION`,
    },
  ];

  return (
    <ImportPage
      title="Import trading"
      description={`Publish ${IMPORT_COPY.ownPlural.toLowerCase()} for international cargo and negotiate anonymously with verified counterparties.`}
      actions={canManage ? <CreateButton /> : undefined}
    >
      {summary.isError ? (
        <ErrorPanel
          message={parseImportError(summary.error).message}
          onRetry={() => void summary.refetch()}
        />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t.label}</p>
                {summary.isLoading ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-1 text-3xl font-semibold tracking-tight">
                    {t.value}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FilePlus2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">
                Post a {IMPORT_COPY.own.toLowerCase()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe product, quantity, Incoterm, ports and shipment window.
                Matching {IMPORT_COPY.marketPlural.toLowerCase()} are scored
                automatically on transparent criteria.
              </p>
              {canManage ? (
                <Button asChild variant="link" className="mt-1 h-auto p-0">
                  <Link href={IMPORT_ROUTES.create}>Start a draft</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageSearch className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">
                Browse {IMPORT_COPY.marketPlural.toLowerCase()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Filter live {IMPORT_COPY.marketPlural.toLowerCase()} by product,
                Incoterm, port and shipment window. Counterparty identities stay
                hidden until a deal is confirmed.
              </p>
              <Button asChild variant="link" className="mt-1 h-auto p-0">
                <Link href={IMPORT_ROUTES.market}>Browse now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ImportPage>
  );
}

// My listings ----------------------------------------------------------------

const MINE_TABS = [
  { id: "all", label: "All", status: undefined },
  { id: "draft", label: "Drafts", status: "DRAFT" },
  {
    id: "live",
    label: "Live",
    status: "PUBLISHED,MATCHING,OFFER_RECEIVED,NEGOTIATION,PAUSED",
  },
  {
    id: "matched",
    label: "Matched & deals",
    status: "MATCHED,DEAL_CONFIRMED,PARTIALLY_FULFILLED,FULFILLED",
  },
  { id: "closed", label: "Expired & cancelled", status: "EXPIRED,CANCELLED" },
] as const;

export function ImportMyListingsPage({ initialTab }: { initialTab?: string }) {
  const [tab, setTab] = useState<string>(
    MINE_TABS.some((t) => t.id === initialTab) ? initialTab! : "all",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 300);
  const status = MINE_TABS.find((t) => t.id === tab)?.status;

  const query: ListingQuery = {
    scope: "mine",
    status,
    search: debounced || undefined,
    page,
    limit: 20,
  };
  const listings = useImportListings(IMPORT_OWN_SIDE, query);
  const canManage = useCanManageImport();

  return (
    <ImportPage
      title={`My ${IMPORT_COPY.ownPlural.toLowerCase()}`}
      description="Drafts save automatically. Published listings are matched and visible to verified counterparties without revealing your identity."
      breadcrumbs={[{ label: `My ${IMPORT_COPY.ownPlural.toLowerCase()}` }]}
      actions={canManage ? <CreateButton /> : undefined}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {MINE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search product, grade, brand or reference"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {listings.isLoading ? (
        <ListSkeleton />
      ) : listings.isError ? (
        <ErrorPanel
          message={parseImportError(listings.error).message}
          onRetry={() => void listings.refetch()}
        />
      ) : !listings.data?.items.length ? (
        <EmptyList
          title={
            debounced || status
              ? "Nothing matches these filters"
              : `No ${IMPORT_COPY.ownPlural.toLowerCase()} yet`
          }
          description={
            debounced || status
              ? "Try another tab or clear the search."
              : `Create your first ${IMPORT_COPY.own.toLowerCase()} to start receiving matched offers.`
          }
          action={
            canManage && !debounced && !status ? <CreateButton /> : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {listings.data.items.map((l) => (
            <ImportListingRow
              key={l.id}
              listing={l}
              href={
                canManage && l.status === "DRAFT"
                  ? IMPORT_ROUTES.edit(l.id)
                  : IMPORT_ROUTES.mineDetail(l.id)
              }
              fetchedAt={listings.dataUpdatedAt}
            />
          ))}
          <Pager
            page={listings.data.meta.page}
            totalPages={listings.data.meta.totalPages}
            total={listings.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
    </ImportPage>
  );
}

// Market ---------------------------------------------------------------------

type MarketFilters = {
  categoryId?: string;
  categoryLabel?: string;
  originCountryId?: string;
  incotermId?: string;
  polId?: string;
  polLabel?: string;
  podId?: string;
  podLabel?: string;
  currencyCode?: string;
  priceMin?: string;
  priceMax?: string;
  shipmentFrom?: string;
  shipmentTo?: string;
  sort: string;
};

type SortOption = { label: string; sortBy: string; sortOrder: "asc" | "desc" };

const DEFAULT_SORT: SortOption = {
  label: "Newest first",
  sortBy: "publishedAt",
  sortOrder: "desc",
};

const SORTS: Record<string, SortOption> = {
  newest: DEFAULT_SORT,
  expiring: { label: "Expiring soon", sortBy: "validUntil", sortOrder: "asc" },
  shipment: { label: "Earliest shipment", sortBy: "esd", sortOrder: "asc" },
  priceAsc: { label: "Price: low to high", sortBy: "price", sortOrder: "asc" },
  quantityDesc: {
    label: "Quantity: high to low",
    sortBy: "quantity",
    sortOrder: "desc",
  },
};

export function ImportMarketPage() {
  const master = useImportMaster();
  const [filters, setFilters] = useState<MarketFilters>({ sort: "newest" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debounced = useDebounce(search.trim(), 300);

  const priceInvalid =
    (filters.priceMin && !DECIMAL_PRICE.test(filters.priceMin)) ||
    (filters.priceMax && !DECIMAL_PRICE.test(filters.priceMax));
  const priceNeedsCurrency = Boolean(
    (filters.priceMin || filters.priceMax) && !filters.currencyCode,
  );
  const sort = SORTS[filters.sort] ?? DEFAULT_SORT;
  const sortNeedsCurrency =
    filters.sort === "priceAsc" && !filters.currencyCode;

  const query = useMemo<ListingQuery>(
    () => ({
      scope: "market",
      search: debounced || undefined,
      categoryId: filters.categoryId,
      originCountryId: filters.originCountryId,
      incotermId: filters.incotermId,
      polId: filters.polId,
      podId: filters.podId,
      currencyCode: filters.currencyCode,
      priceMin:
        priceInvalid || priceNeedsCurrency ? undefined : filters.priceMin,
      priceMax:
        priceInvalid || priceNeedsCurrency ? undefined : filters.priceMax,
      shipmentFrom: filters.shipmentFrom,
      shipmentTo: filters.shipmentTo,
      sortBy: sortNeedsCurrency ? "publishedAt" : sort.sortBy,
      sortOrder: sortNeedsCurrency ? "desc" : sort.sortOrder,
      page,
      limit: 20,
    }),
    [
      debounced,
      filters,
      page,
      priceInvalid,
      priceNeedsCurrency,
      sort,
      sortNeedsCurrency,
    ],
  );
  const listings = useImportListings(IMPORT_MARKET_SIDE, query);

  const update = (patch: Partial<MarketFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const activeCount = [
    filters.categoryId,
    filters.originCountryId,
    filters.incotermId,
    filters.polId,
    filters.podId,
    filters.currencyCode,
    filters.priceMin,
    filters.priceMax,
    filters.shipmentFrom,
    filters.shipmentTo,
  ].filter(Boolean).length;
  const bundle = master.data;

  return (
    <ImportPage
      title={IMPORT_COPY.marketPlural}
      description={`Live ${IMPORT_COPY.marketPlural.toLowerCase()} from verified counterparties. Identities are hidden until both sides confirm a deal.`}
      breadcrumbs={[{ label: IMPORT_COPY.marketPlural }]}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search product, grade, brand or reference"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={filters.sort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORTS).map(([id, s]) => (
              <SelectItem key={id} value={id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal /> Filters{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </div>

      {showFilters && bundle ? (
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Product">
              <SearchSelect
                value={filters.categoryId}
                selectedLabel={filters.categoryLabel}
                onChange={(v, o) =>
                  update({
                    categoryId: v ?? undefined,
                    categoryLabel: o?.label,
                  })
                }
                load={async (s) =>
                  (await fetchImportProducts(s || undefined)).map((p) => ({
                    value: p.id,
                    label: p.displayName ?? p.name,
                  }))
                }
                queryKey={["import", "products"]}
                placeholder="Any product"
              />
            </Field>
            <Field label="Origin">
              <SearchSelect
                value={filters.originCountryId}
                onChange={(v) => update({ originCountryId: v ?? undefined })}
                options={bundle.countries.map((c) => ({
                  value: c.id,
                  label: c.name,
                  hint: c.code,
                }))}
                placeholder="Any origin"
              />
            </Field>
            <Field label="Incoterm">
              <Select
                value={filters.incotermId ?? "any"}
                onValueChange={(v) =>
                  update({ incotermId: v === "any" ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Incoterm</SelectItem>
                  {bundle.incoterms.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Currency">
              <Select
                value={filters.currencyCode ?? "any"}
                onValueChange={(v) =>
                  update({ currencyCode: v === "any" ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any currency</SelectItem>
                  {bundle.currencies.map((c) => (
                    <SelectItem key={c.id} value={c.code}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Port of loading">
              <SearchSelect
                value={filters.polId}
                selectedLabel={filters.polLabel}
                onChange={(v, o) =>
                  update({ polId: v ?? undefined, polLabel: o?.label })
                }
                load={async (s) =>
                  (await fetchImportPorts(s || undefined)).map((p) => ({
                    value: p.id,
                    label: portLabel(p),
                  }))
                }
                queryKey={["import", "ports"]}
                placeholder="Any POL"
              />
            </Field>
            <Field label="Port of discharge">
              <SearchSelect
                value={filters.podId}
                selectedLabel={filters.podLabel}
                onChange={(v, o) =>
                  update({ podId: v ?? undefined, podLabel: o?.label })
                }
                load={async (s) =>
                  (await fetchImportPorts(s || undefined)).map((p) => ({
                    value: p.id,
                    label: portLabel(p),
                  }))
                }
                queryKey={["import", "ports"]}
                placeholder="Any POD"
              />
            </Field>
            <Field
              label="Price range"
              error={
                priceInvalid
                  ? "Enter valid numbers."
                  : priceNeedsCurrency
                    ? "Choose a currency to filter by price."
                    : undefined
              }
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  inputMode="decimal"
                  value={filters.priceMin ?? ""}
                  onChange={(e) =>
                    update({ priceMin: e.target.value || undefined })
                  }
                />
                <Input
                  placeholder="Max"
                  inputMode="decimal"
                  value={filters.priceMax ?? ""}
                  onChange={(e) =>
                    update({ priceMax: e.target.value || undefined })
                  }
                />
              </div>
            </Field>
            <Field label="Shipment between">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.shipmentFrom ?? ""}
                  onChange={(e) =>
                    update({ shipmentFrom: e.target.value || undefined })
                  }
                />
                <Input
                  type="date"
                  value={filters.shipmentTo ?? ""}
                  onChange={(e) =>
                    update({ shipmentTo: e.target.value || undefined })
                  }
                />
              </div>
            </Field>
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  update({
                    sort: filters.sort,
                    categoryId: undefined,
                    categoryLabel: undefined,
                    originCountryId: undefined,
                    incotermId: undefined,
                    polId: undefined,
                    polLabel: undefined,
                    podId: undefined,
                    podLabel: undefined,
                    currencyCode: undefined,
                    priceMin: undefined,
                    priceMax: undefined,
                    shipmentFrom: undefined,
                    shipmentTo: undefined,
                  })
                }
              >
                Clear filters
              </Button>
              {sortNeedsCurrency ? (
                <p className="ml-3 text-xs text-muted-foreground">
                  Price sorting needs a currency — prices in different
                  currencies are never compared.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {listings.isLoading ? (
        <ListSkeleton />
      ) : listings.isError ? (
        <ErrorPanel
          message={parseImportError(listings.error).message}
          onRetry={() => void listings.refetch()}
        />
      ) : !listings.data?.items.length ? (
        <EmptyList
          title={`No ${IMPORT_COPY.marketPlural.toLowerCase()} found`}
          description={
            activeCount || debounced
              ? "Try widening your filters."
              : `New ${IMPORT_COPY.marketPlural.toLowerCase()} appear here as soon as they are published.`
          }
        />
      ) : (
        <div className="space-y-3">
          {listings.data.items.map((l) => (
            <ImportListingRow
              key={l.id}
              listing={l}
              href={IMPORT_ROUTES.marketDetail(l.id)}
              fetchedAt={listings.dataUpdatedAt}
              showCounterparty
            />
          ))}
          <Pager
            page={listings.data.meta.page}
            totalPages={listings.data.meta.totalPages}
            total={listings.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Handshake className="h-3.5 w-3.5" /> {IMPORT_COPY.marketPlural} show
        only commercial terms. {IMPORT_COPY.counterparty} identity is revealed
        after both parties confirm a deal.
      </p>
    </ImportPage>
  );
}
