"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Clock,
  Eye,
  FilePlus2,
  Gauge,
  LifeBuoy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Ship,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useImportAccess,
  useImportAvailability,
  useServerCountdown,
} from "@/hooks/use-import";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/lib/constants";
import { IMPORT_COPY, IMPORT_ROUTES } from "@/lib/import/config";
import {
  formatDateTime,
  formatRemaining,
  importLabel,
  TONE_CLASS,
  toneFor,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types/common";

const SUB_NAV = [
  { href: IMPORT_ROUTES.root, label: "Overview", exact: true },
  {
    href: IMPORT_ROUTES.mine,
    label: `My ${IMPORT_COPY.ownPlural.toLowerCase()}`,
  },
  { href: IMPORT_ROUTES.market, label: IMPORT_COPY.marketPlural },
  { href: IMPORT_ROUTES.negotiations, label: "Negotiations" },
  { href: IMPORT_ROUTES.deals, label: "Deals" },
  { href: IMPORT_ROUTES.shipments, label: "Shipments" },
];

export const IMPORT_VIEW_ONLY = "You have view-only access to Import Trading";

export function ImportViewOnlyNote({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700",
        className,
      )}
    >
      <Eye className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <span>
        {IMPORT_VIEW_ONLY}. You can browse listings, negotiations, deals and
        shipments; ask a Super Admin to update your permissions to make changes.
      </span>
    </div>
  );
}

export function ImportPage({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const availability = useImportAvailability();
  const { canManage } = useImportAccess();
  const enabled = availability.status === "enabled";

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Import", href: IMPORT_ROUTES.root },
          ...(breadcrumbs ?? []),
        ]}
        actions={enabled ? actions : undefined}
      />
      {enabled ? (
        <nav
          aria-label="Import sections"
          className="-mt-2 flex gap-1 overflow-x-auto border-b border-slate-200"
        >
          {SUB_NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {enabled && !canManage ? <ImportViewOnlyNote /> : null}
      {availability.status === "loading" ? (
        <div
          className="space-y-4"
          aria-busy="true"
          aria-label="Loading import trading"
        >
          <Skeleton className="h-9 w-full max-w-md rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[92px] rounded-2xl" />
            ))}
          </div>
        </div>
      ) : availability.status === "enabled" ? (
        children
      ) : (
        <ImportUnavailable
          reason={availability.status}
          retrying={availability.retrying}
          onRetry={availability.retry}
        />
      )}
    </PageContainer>
  );
}

const IMPORT_HIGHLIGHTS = [
  {
    icon: FilePlus2,
    title: `Publish ${IMPORT_COPY.ownPlural.toLowerCase()}`,
    body: "Product, quantity, Incoterm, ports and shipment window in one structured form.",
  },
  {
    icon: Gauge,
    title: "Transparent matching",
    body: `Matching ${IMPORT_COPY.marketPlural.toLowerCase()} are scored on fixed criteria, with the evidence shown.`,
  },
  {
    icon: ShieldCheck,
    title: "Anonymous negotiation",
    body: "Buyer identities stay hidden until both sides confirm the deal.",
  },
];

function ImportUnavailable({
  reason,
  retrying,
  onRetry,
}: {
  reason: "disabled" | "unavailable";
  retrying: boolean;
  onRetry: () => void;
}) {
  const offline = reason === "unavailable";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F1FF] text-[#1B6EF3]">
          <Ship className="h-7 w-7" />
        </span>
        <span
          className={cn(
            "mt-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            offline
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {offline ? "Not reachable" : "Switched off"}
        </span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
          {offline
            ? "Import trading isn't available right now"
            : "Import trading is currently switched off"}
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {offline
            ? "We couldn't load import trading from the server. It may not be live for your account yet, or the connection dropped. Try again in a moment."
            : "Our team has paused international buying and selling for now. Your domestic products, offers and orders work as usual."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {offline ? (
            <Button onClick={onRetry} disabled={retrying}>
              {retrying ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              {retrying ? "Checking…" : "Try again"}
            </Button>
          ) : null}
          <Button asChild variant={offline ? "outline" : "default"}>
            <Link href={ROUTES.OFFERS}>
              <Tag className="mr-1 h-4 w-4" /> Go to My Offers
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={ROUTES.SUPPORT}>
              <LifeBuoy className="mr-1 h-4 w-4" /> Contact support
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
        {IMPORT_HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 bg-slate-50 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASS[toneFor(status)],
        className,
      )}
    >
      {importLabel(status)}
    </span>
  );
}

export function ImportValidity({
  validUntil,
  secondsRemaining,
  fetchedAt,
  className,
}: {
  validUntil: string | null;
  secondsRemaining: number | null;
  fetchedAt: number;
  className?: string;
}) {
  const left = useServerCountdown(secondsRemaining, fetchedAt);
  const urgent = left !== null && left < 24 * 3600;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        left === 0
          ? "text-red-600"
          : urgent
            ? "text-amber-700"
            : "text-muted-foreground",
        className,
      )}
      title={
        validUntil ? `Valid until ${formatDateTime(validUntil)}` : undefined
      }
    >
      <Clock className="h-3.5 w-3.5" />
      {formatRemaining(left)}
    </span>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[13px] font-medium text-slate-700"
      >
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export type SelectOption = { value: string; label: string; hint?: string };

/**
 * Searchable single-select. Pass `options` for small static lists, or `load`
 * for server-side search (the backend filters; nothing is filtered locally).
 */
export function SearchSelect({
  value,
  selectedLabel,
  onChange,
  options,
  load,
  queryKey,
  placeholder = "Select…",
  disabled,
  invalid,
  allowClear = true,
  id,
}: {
  value: string | null | undefined;
  selectedLabel?: string | null;
  onChange: (value: string | null, option?: SelectOption) => void;
  options?: SelectOption[];
  load?: (search: string) => Promise<SelectOption[]>;
  queryKey?: readonly unknown[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  allowClear?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);
  const remote = useQuery({
    queryKey: [...(queryKey ?? ["import", "search"]), debounced],
    queryFn: () => load!(debounced),
    enabled: Boolean(load) && open,
    staleTime: 60 * 1000,
  });

  const list = load
    ? (remote.data ?? [])
    : (options ?? []).filter((o) =>
        search
          ? `${o.label} ${o.hint ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase())
          : true,
      );
  const label =
    selectedLabel ??
    options?.find((o) => o.value === value)?.label ??
    remote.data?.find((o) => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-xl px-3 font-normal",
            !value && "text-muted-foreground",
            invalid && "border-red-400",
          )}
        >
          <span className="truncate">
            {value && label ? label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[260px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {remote.isFetching ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
              </div>
            ) : null}
            {remote.isError && !remote.isFetching ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-red-600">
                <span>Unable to load options.</span>
                <button
                  type="button"
                  className="font-medium underline"
                  onClick={() => void remote.refetch()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <CommandEmpty>No results.</CommandEmpty>
            )}
            {allowClear && value ? (
              <CommandItem
                value="__clear"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-muted-foreground"
              >
                Clear selection
              </CommandItem>
            ) : null}
            {list.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value, option);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{option.label}</span>
                {option.hint ? (
                  <span className="ml-auto pl-2 text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function KeyValueGrid({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode; wide?: boolean }>;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(item.wide && "sm:col-span-2 lg:col-span-3")}
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 whitespace-pre-line text-sm text-foreground">
            {item.value === null ||
            item.value === undefined ||
            item.value === ""
              ? "—"
              : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Pager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return total ? (
      <p className="text-xs text-muted-foreground">
        {total} result{total === 1 ? "" : "s"}
      </p>
    ) : null;
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages} · {total} results
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
