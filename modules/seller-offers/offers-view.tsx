"use client";

import {
  Inbox,
  Layers,
  MessageSquarePlus,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { OffersPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { formatMt, formatPricePerKg, hoursLeft } from "@/lib/seller/format";
import { formatDateTime } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerStore } from "@/store/sellerStore";
import type { SellerOffer } from "@/types/seller";

export function SellerOffersView() {
  const location = useLocationStore((s) => s.getSelectedLocation());
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const hydrateLocations = useLocationStore((s) => s.hydrate);
  const offers = useSellerOfferStore((s) => s.offers);
  const loading = useSellerOfferStore((s) => s.loading);
  const loadError = useSellerOfferStore((s) => s.loadError);
  const hydrate = useSellerOfferStore((s) => s.hydrate);
  const search = useSellerOfferStore((s) => s.search);
  const setSearch = useSellerOfferStore((s) => s.setSearch);
  const confirm = useSellerOfferStore((s) => s.confirm);
  const openConfirm = useSellerOfferStore((s) => s.openConfirm);
  const closeConfirm = useSellerOfferStore((s) => s.closeConfirm);
  const setOfferStatus = useSellerOfferStore((s) => s.setOfferStatus);
  const activateAll = useSellerOfferStore((s) => s.activateAll);
  const deactivateAll = useSellerOfferStore((s) => s.deactivateAll);
  const addRemark = useSellerOfferStore((s) => s.addRemark);
  const addBulkPrice = useSellerOfferStore((s) => s.addBulkPrice);
  const deleteOffer = useSellerOfferStore((s) => s.deleteOffer);
  const getSummary = useSellerOfferStore((s) => s.getSummary);
  const addActivity = useSellerStore((s) => s.addActivity);
  const [remarkId, setRemarkId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    void (async () => {
      await hydrateLocations();
      await hydrate();
    })();
  }, [hydrate, hydrateLocations]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void hydrate({ search });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [search, hydrate]);

  const scoped = useMemo(
    () =>
      offers.filter(
        (offer) =>
          !locationId || !offer.locationId || offer.locationId === locationId,
      ),
    [locationId, offers],
  );
  const summary = getSummary(locationId);
  const lastUpdated = scoped[0]?.updatedAt;

  const runConfirm = async () => {
    setMutating(true);
    try {
      if (confirm.type === "activate" && confirm.offerId) {
        await setOfferStatus(confirm.offerId, "active");
        toast.success("Offer activated successfully.");
      }
      if (confirm.type === "deactivate" && confirm.offerId) {
        await setOfferStatus(confirm.offerId, "paused");
        toast.success("Offer paused successfully.");
      }
      if (confirm.type === "activate_all") {
        const count = await activateAll(locationId);
        toast.success(
          count ? `${count} offers activated` : "No offers were activated",
        );
      }
      if (confirm.type === "deactivate_all") {
        const count = await deactivateAll(locationId);
        toast.success(
          count ? `${count} offers paused` : "No offers were paused",
        );
        addActivity({
          type: "offer",
          title: "Offers paused",
          description: `${location?.name ?? "Location"} offers paused`,
        });
      }
      if (confirm.type === "delete" && confirm.offerId) {
        await deleteOffer(confirm.offerId);
        toast.success("Offer cancelled");
      }
      closeConfirm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update offer. Please try again.",
      );
    } finally {
      setMutating(false);
    }
  };

  if (loading) {
    return <OffersPageSkeleton />;
  }

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current location
          </p>
          <h1 className="text-2xl font-semibold">
            {location?.name ?? "No location configured"}{" "}
            {location ? (
              <span className="text-sm font-medium uppercase text-emerald-600">
                {location.status}
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: {lastUpdated ? formatDateTime(lastUpdated) : "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={summary.draft + summary.paused === 0 || mutating}
            onClick={() => openConfirm("activate_all")}
          >
            <Play className="h-4 w-4" />
            Activate all
          </Button>
          <Button
            variant="outline"
            disabled={summary.active === 0 || mutating}
            onClick={() => openConfirm("deactivate_all")}
          >
            <Pause className="h-4 w-4" />
            Deactivate all
          </Button>
          <span className="hidden h-6 w-px bg-slate-200 lg:block" aria-hidden />
          <Button variant="outline" asChild>
            <Link href={ROUTES.PRODUCTS_NEW}>
              <Plus className="h-4 w-4" />
              Add grade
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.OFFERS_NEW}>
              <Plus className="h-4 w-4" />
              Add offer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Active Offers" value={summary.active} />
        <Summary
          label="Pending Purchase Requests"
          value={summary.pendingPurchaseRequests}
        />
        <Summary label="Expiring Soon" value={summary.expiring} />
        <Summary label="Sold Out" value={summary.soldOut} />
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search offers by grade, product, or offer number"
      />

      {loadError ? (
        <EmptyState
          icon={Tag}
          title="Unable to load offers"
          description={loadError}
          action={<Button onClick={() => void hydrate()}>Try again</Button>}
        />
      ) : scoped.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={search ? "No offers match your search" : "No offers yet"}
          description={
            search
              ? "Clear search or adjust filters to see more offers."
              : "Create your first offer to start receiving purchase requests."
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Button asChild>
                <Link href={ROUTES.OFFERS_NEW}>Create Offer</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scoped.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onActivate={() => openConfirm("activate", offer.id)}
              onDeactivate={() => openConfirm("deactivate", offer.id)}
              onAddBulkPrice={() => {
                void addBulkPrice(offer.id, {
                  minQty: 100,
                  maxQty: null,
                  price: Math.max(offer.price - 3, 1),
                })
                  .then(() => toast.success("Bulk price added"))
                  .catch((error: unknown) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to add bulk price",
                    ),
                  );
              }}
              onAddRemark={() => {
                setRemarkId(offer.id);
                setRemark(offer.remarks);
              }}
              onDelete={() => openConfirm("delete", offer.id)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => !open && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm.type === "deactivate_all"
                ? `Pause all ${summary.active} active offers?`
                : confirm.type === "activate_all"
                  ? "Activate all draft and paused offers?"
                  : confirm.type === "delete"
                    ? "Cancel this offer?"
                    : confirm.type === "deactivate"
                      ? "Pause this offer?"
                      : "Activate this offer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.type === "deactivate" ||
              confirm.type === "deactivate_all"
                ? "Pausing removes the offer from active customer marketplace availability."
                : "This updates your live marketplace offers for the current location."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutating}
              onClick={(event) => {
                event.preventDefault();
                void runConfirm();
              }}
              className={
                confirm.type === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirm.type === "delete"
                ? "Cancel offer"
                : confirm.type === "deactivate" ||
                    confirm.type === "deactivate_all"
                  ? "Pause"
                  : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(remarkId)}
        onOpenChange={() => setRemarkId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add remark</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (remarkId) {
                  void addRemark(remarkId, remark)
                    .then(() => toast.success("Remark saved"))
                    .catch((error: unknown) =>
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to save remark",
                      ),
                    );
                }
                setRemarkId(null);
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function OfferCard({
  offer,
  onActivate,
  onDeactivate,
  onAddBulkPrice,
  onAddRemark,
  onDelete,
}: {
  offer: SellerOffer;
  onActivate: () => void;
  onDeactivate: () => void;
  onAddBulkPrice: () => void;
  onAddRemark: () => void;
  onDelete: () => void;
}) {
  const isActive = offer.status === "active";

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {offer.referenceNumber ?? offer.category}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{offer.gradeName}</h2>
        <p className="mt-2 text-2xl font-semibold text-[#1B6EF3]">
          {formatPricePerKg(offer.price)}
        </p>
        <dl className="mt-3 space-y-1 text-sm text-slate-600">
          <div>Available: {formatMt(offer.availableQty)}</div>
          <div>MOQ: {formatMt(offer.moq)}</div>
          {offer.warehouseName ? (
            <div>Warehouse: {offer.warehouseName}</div>
          ) : null}
          <div>
            Validity: {hoursLeft(offer.validUntil) || offer.validityHours} hours
          </div>
          <div>PRs: {offer.purchaseRequestCount ?? 0}</div>
        </dl>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SellerStatusBadge status={offer.status} />
          {offer.bulkPricing.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {offer.bulkPricing.length} bulk{" "}
              {offer.bulkPricing.length === 1 ? "slab" : "slabs"}
            </span>
          ) : null}
        </div>
        {offer.remarks ? (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
            {offer.remarks}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Button
          size="sm"
          variant={isActive ? "default" : "outline"}
          className="h-9 min-w-0 flex-1"
          asChild
        >
          <Link href={`${ROUTES.OFFERS}/${offer.id}`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        {isActive ? (
          <Button
            size="sm"
            variant="outline"
            className="h-9 min-w-0 flex-1"
            onClick={onDeactivate}
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </Button>
        ) : (
          <Button size="sm" className="h-9 min-w-0 flex-1" onClick={onActivate}>
            <Play className="h-3.5 w-3.5" />
            Activate
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              aria-label={`More actions for ${offer.gradeName}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onAddBulkPrice}>
              <Layers className="h-4 w-4" />
              Add bulk price
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddRemark}>
              <MessageSquarePlus className="h-4 w-4" />
              Add remark
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.PURCHASE_REQUESTS}>
                <Inbox className="h-4 w-4" />
                View requests
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
