"use client";

import {
  Banknote,
  ClipboardList,
  Package,
  Plus,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { KpiCard } from "@/components/cards/kpi-card";
import { PageContainer } from "@/components/common/page-container";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import {
  formatInrShort,
  formatMt,
  formatPricePerKg,
  greetingForHour,
  hoursLeft,
} from "@/lib/seller/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";
import { useSellerNotificationStore } from "@/store/sellerNotificationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerOrderStore } from "@/store/sellerOrderStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerRequestStore } from "@/store/sellerRequestStore";
import { useSellerStore } from "@/store/sellerStore";

export function DashboardView() {
  const [ready] = useState(true);
  const user = useAuthStore((s) => s.user);
  const seller = useSellerStore((s) => s.seller);
  const activity = useSellerStore((s) => s.activity);
  const location = useLocationStore((s) => s.getSelectedLocation());
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const products = useSellerProductStore((s) => s.products);
  const offers = useSellerOfferStore((s) => s.offers);
  const requests = useSellerRequestStore((s) => s.requests);
  const orders = useSellerOrderStore((s) => s.orders);
  const dispatches = useSellerOrderStore((s) => s.dispatches);
  const settlements = useSellerFinanceStore((s) => s.settlements);
  const unread = useSellerNotificationStore((s) => s.getUnreadCount());

  const scopedProducts = useMemo(
    () => products.filter((item) => item.locationId === locationId),
    [locationId, products],
  );
  const scopedOffers = useMemo(
    () => offers.filter((item) => item.locationId === locationId),
    [locationId, offers],
  );
  const scopedRequests = useMemo(
    () => requests.filter((item) => item.locationId === locationId),
    [locationId, requests],
  );
  const scopedOrders = useMemo(
    () => orders.filter((item) => item.locationId === locationId),
    [locationId, orders],
  );
  const scopedDispatch = useMemo(
    () => dispatches.filter((item) => item.locationId === locationId),
    [dispatches, locationId],
  );

  const activeOffers = scopedOffers.filter(
    (item) => item.status === "active",
  ).length;
  const pendingRequests = scopedRequests.filter(
    (item) => item.status === "new" || item.status === "under_review",
  ).length;
  const activeOrders = scopedOrders.filter(
    (item) => !["delivered", "cancelled"].includes(item.status),
  ).length;
  const pendingDispatch = scopedDispatch.filter(
    (item) => item.status !== "dispatched",
  ).length;
  const receivable = settlements
    .filter((item) => item.status !== "settled")
    .reduce((sum, item) => sum + item.amount, 0);

  const name = user?.name ?? seller.contactPerson;

  if (!ready) {
    return (
      <PageContainer className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greetingForHour()}, {name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {location?.name ?? "Select location"} ·{" "}
            <span className="capitalize">{location?.status ?? "inactive"}</span>
            {unread > 0 ? ` · ${unread} unread notifications` : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={ROUTES.OFFERS_NEW}>
              <Plus className="mr-1 h-4 w-4" /> Add Offer
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.PURCHASE_REQUESTS}>View Purchase Requests</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard
          label="My Products"
          value={`${scopedProducts.length} Grades`}
          icon={Package}
        />
        <KpiCard
          label="Active Offers"
          value={String(activeOffers)}
          icon={Tag}
        />
        <KpiCard
          label="Purchase Requests"
          value={String(pendingRequests)}
          hint="Awaiting response"
          icon={ClipboardList}
        />
        <KpiCard
          label="Active Orders"
          value={String(activeOrders)}
          icon={ShoppingCart}
        />
        <KpiCard
          label="Pending Dispatch"
          value={String(pendingDispatch)}
          icon={Truck}
        />
        <KpiCard
          label="Outstanding Settlement"
          value={formatInrShort(receivable)}
          icon={Banknote}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { href: ROUTES.OFFERS_NEW, label: "+ Add Offer" },
          { href: ROUTES.PURCHASE_REQUESTS, label: "View Purchase Requests" },
          { href: ROUTES.ORDERS, label: "View Orders" },
          { href: ROUTES.DISPATCH, label: "Dispatch" },
          { href: ROUTES.SHIPMENTS, label: "Shipment Tracking" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-[#1B6EF3] hover:text-[#1B6EF3]"
          >
            {action.label}
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">My Offers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.OFFERS}>View all</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {scopedOffers.slice(0, 3).map((offer) => (
            <Link
              key={offer.id}
              href={`${ROUTES.OFFERS}/${offer.id}`}
              className="rounded-lg border border-slate-200 p-4 hover:border-[#1B6EF3]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {offer.category}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {offer.gradeName}
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1B6EF3]">
                {formatPricePerKg(offer.price)}
              </p>
              <div className="mt-3">
                <SellerStatusBadge status={offer.status} />
              </div>
            </Link>
          ))}
          {scopedOffers.length === 0 ? (
            <p className="text-sm text-slate-500">
              No offers at this location. Create one to start receiving
              requests.
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Purchase Requests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.PURCHASE_REQUESTS}>View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {scopedRequests.slice(0, 4).map((request) => (
              <div
                key={request.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {request.requestNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatMt(request.quantityMt)} · {request.gradeName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {request.buyerLabel} · {request.buyerId}
                  </p>
                </div>
                <SellerStatusBadge status={request.status} />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Upcoming Dispatch</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.DISPATCH}>View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {scopedDispatch.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.orderId}</p>
                  <p className="text-xs text-slate-500">
                    {formatMt(item.quantityMt)} · {item.gradeName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.loadingLocation} · {item.scheduledDate}
                  </p>
                </div>
                <SellerStatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ORDERS}>View all</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Order ID</th>
                <th className="pb-2 font-medium">Grade</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {scopedOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium">
                    <Link
                      href={`${ROUTES.ORDERS}/${order.id}`}
                      className="text-[#1B6EF3]"
                    >
                      {order.orderId}
                    </Link>
                  </td>
                  <td>{order.gradeName}</td>
                  <td>{formatMt(order.quantityMt)}</td>
                  <td>{order.locationName}</td>
                  <td>{formatInrShort(order.orderValue)}</td>
                  <td>
                    <SellerStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Offer Alerts</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.OFFERS}>Manage offers</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {scopedOffers
              .filter((offer) => hoursLeft(offer.validUntil) <= 16)
              .slice(0, 4)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{offer.gradeName}</p>
                    <p className="text-xs text-slate-500">
                      {hoursLeft(offer.validUntil)} hours left ·{" "}
                      {formatPricePerKg(offer.price)}
                    </p>
                  </div>
                  <SellerStatusBadge status={offer.status} />
                </div>
              ))}
            {scopedOffers.filter((offer) => hoursLeft(offer.validUntil) <= 16)
              .length === 0 ? (
              <p className="text-sm text-slate-500">
                No expiring offers right now.
              </p>
            ) : null}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Settlement Summary</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.SETTLEMENTS}>View all</Link>
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-slate-500">Settled</dt>
              <dd className="font-semibold">
                {formatInrShort(
                  settlements
                    .filter((item) => item.status === "settled")
                    .reduce((sum, item) => sum + item.amount, 0),
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Outstanding</dt>
              <dd className="font-semibold">{formatInrShort(receivable)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold">Seller Activity</h2>
        <ol className="space-y-3">
          {activity.slice(0, 6).map((item, index) => (
            <li key={item.id} className="flex gap-3">
              <span
                className={cn(
                  "mt-1 h-2 w-2 rounded-full",
                  index === 0 ? "bg-[#1B6EF3]" : "bg-slate-300",
                )}
              />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </PageContainer>
  );
}
