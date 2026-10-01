"use client";

import {
  Banknote,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { KpiCard } from "@/components/cards/kpi-card";
import { PageContainer } from "@/components/common/page-container";
import { DashboardPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { useSellerSettlementSummary } from "@/hooks/use-seller-settlements";
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
import { useSellerNotificationStore } from "@/store/sellerNotificationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerOrderStore } from "@/store/sellerOrderStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerRequestStore } from "@/store/sellerRequestStore";
import { useSellerStore } from "@/store/sellerStore";

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const seller = useSellerStore((s) => s.seller);
  const activity = useSellerStore((s) => s.activity);
  const syncSellerAccount = useSellerStore((s) => s.syncFromApi);
  const location = useLocationStore((s) => s.getSelectedLocation());
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const products = useSellerProductStore((s) => s.products);
  const fetchProducts = useSellerProductStore((s) => s.fetchProducts);
  const productsLoading = useSellerProductStore((s) => s.loading);
  const productsError = useSellerProductStore((s) => s.loadError);
  const offers = useSellerOfferStore((s) => s.offers);
  const requests = useSellerRequestStore((s) => s.requests);
  const hydrateRequests = useSellerRequestStore((s) => s.hydrate);
  const orders = useSellerOrderStore((s) => s.orders);
  const dispatches = useSellerOrderStore((s) => s.dispatches);
  const hydrateOrders = useSellerOrderStore((s) => s.hydrate);
  const settlementSummary = useSellerSettlementSummary();
  const unread = useSellerNotificationStore((s) => s.getUnreadCount());

  useEffect(() => {
    void syncSellerAccount();
  }, [syncSellerAccount]);

  useEffect(() => {
    void fetchProducts();
    void hydrateRequests();
    void hydrateOrders({ page: 1, limit: 20 });
  }, [fetchProducts, hydrateOrders, hydrateRequests, locationId]);

  const ready = !productsLoading;

  // Full seller catalog for the My Products KPI (not warehouse-scoped).
  const myProductGrades = products.length;
  const liveProductGrades = products.filter(
    (item) => item.offerStatus === "active",
  ).length;
  const scopedOffers = useMemo(
    () => offers.filter((item) => item.locationId === locationId),
    [locationId, offers],
  );
  // Purchase requests are org-scoped (matched seller), not warehouse-location scoped.
  const scopedRequests = requests;
  // Orders (PurchaseOrders) are seller-org scoped from backend JWT — not location stamped.
  const scopedOrders = orders;
  const scopedDispatch = useMemo(
    () =>
      dispatches.filter(
        (item) => !locationId || item.locationId === locationId,
      ),
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
  const receivable = settlementSummary.data?.outstandingSettlementAmount ?? 0;
  const settledAmount = settlementSummary.data?.settledAmount ?? 0;

  const name = user?.name ?? seller.contactPerson;

  if (!ready) {
    return <DashboardPageSkeleton />;
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
        {productsError ? (
          <KpiCard
            label="My Products"
            value="—"
            hint={productsError}
            tone="error"
            icon={Package}
            footer={
              <button
                type="button"
                onClick={() => void fetchProducts()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B6EF3] hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            }
          />
        ) : (
          <KpiCard
            label="My Products"
            value={`${myProductGrades} ${myProductGrades === 1 ? "Grade" : "Grades"}`}
            hint={
              myProductGrades === 0
                ? "Add your first grade"
                : `${liveProductGrades} live on marketplace`
            }
            href={myProductGrades === 0 ? ROUTES.PRODUCTS_NEW : ROUTES.PRODUCTS}
            icon={Package}
          />
        )}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { href: ROUTES.OFFERS_NEW, label: "+ Add Offer" },
          { href: ROUTES.INVENTORY, label: "Inventory" },
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
                  <p className="mt-1 text-xs text-slate-400">Anonymous Buyer</p>
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
              <dd className="font-semibold">{formatInrShort(settledAmount)}</dd>
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
