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
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
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
  const offers = useSellerOfferStore((s) => s.offers);
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

  const scoped = useMemo(
    () =>
      offers.filter(
        (offer) =>
          offer.locationId === locationId &&
          (!search ||
            offer.gradeName.toLowerCase().includes(search.toLowerCase()) ||
            offer.category.toLowerCase().includes(search.toLowerCase())),
      ),
    [locationId, offers, search],
  );
  const summary = getSummary(locationId);
  const lastUpdated = scoped[0]?.updatedAt;

  const runConfirm = () => {
    if (confirm.type === "activate" && confirm.offerId) {
      setOfferStatus(confirm.offerId, "active");
      toast.success("Offer activated successfully.");
    }
    if (confirm.type === "deactivate" && confirm.offerId) {
      setOfferStatus(confirm.offerId, "paused");
      toast.success("Offer deactivated");
    }
    if (confirm.type === "activate_all") {
      const count = activateAll(locationId);
      toast.success(`${count} offers activated`);
    }
    if (confirm.type === "deactivate_all") {
      const count = deactivateAll(locationId);
      toast.success(`${count} offers deactivated`);
      addActivity({
        type: "offer",
        title: "Offers deactivated",
        description: `${location?.name ?? "Location"} offers paused`,
      });
    }
    if (confirm.type === "delete" && confirm.offerId) {
      deleteOffer(confirm.offerId);
      toast.success("Offer deleted");
    }
    closeConfirm();
  };

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current location
          </p>
          <h1 className="text-2xl font-semibold">
            {location?.name}{" "}
            <span className="text-sm font-medium uppercase text-emerald-600">
              {location?.status}
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Last updated:{" "}
            {lastUpdated ? formatDateTime(lastUpdated) : "24/08/2026, 09:04 AM"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={summary.draft + summary.paused === 0}
            onClick={() => openConfirm("activate_all")}
          >
            <Play className="h-4 w-4" />
            Activate all
          </Button>
          <Button
            variant="outline"
            disabled={summary.active === 0}
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Active" value={summary.active} />
        <Summary label="Draft" value={summary.draft} />
        <Summary label="Expiring soon" value={summary.expiring} />
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search offers by grade"
      />

      {scoped.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No active offers"
          description="Create an offer to start receiving purchase requests."
          action={
            <Button asChild>
              <Link href={ROUTES.OFFERS_NEW}>Create Offer</Link>
            </Button>
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
                addBulkPrice(offer.id, {
                  minQty: 100,
                  maxQty: null,
                  price: Math.max(offer.price - 3, 1),
                });
                toast.success("Bulk price added");
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
                ? `Deactivate all ${summary.active} active offers?`
                : confirm.type === "activate_all"
                  ? "Activate all draft and paused offers?"
                  : confirm.type === "delete"
                    ? "Delete this offer?"
                    : confirm.type === "deactivate"
                      ? "Deactivate this offer?"
                      : "Activate this offer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This updates your live marketplace offers for the current
              location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runConfirm}
              className={
                confirm.type === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirm.type === "delete"
                ? "Delete offer"
                : confirm.type === "deactivate" ||
                    confirm.type === "deactivate_all"
                  ? "Deactivate"
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
                if (remarkId) addRemark(remarkId, remark);
                toast.success("Remark added");
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
          {offer.category}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{offer.gradeName}</h2>
        <p className="mt-2 text-2xl font-semibold text-[#1B6EF3]">
          {formatPricePerKg(offer.price)}
        </p>
        <dl className="mt-3 space-y-1 text-sm text-slate-600">
          <div>Available: {formatMt(offer.availableQty)}</div>
          <div>MOQ: {formatMt(offer.moq)}</div>
          <div>
            Validity: {hoursLeft(offer.validUntil) || offer.validityHours} hours
          </div>
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
            Deactivate
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
              Delete
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
