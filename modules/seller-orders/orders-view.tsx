"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { OrdersPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Timeline } from "@/components/status/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { formatInrShort, formatMt } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import { useSellerOrderStore } from "@/store/sellerOrderStore";
import type { SellerOrderStatus } from "@/types/seller";

const TABS: { id: "all" | SellerOrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "ready_for_dispatch", label: "Ready for Dispatch" },
  { id: "in_transit", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function SellerOrdersView() {
  const orders = useSellerOrderStore((s) => s.orders);
  const loading = useSellerOrderStore((s) => s.loading);
  const loadError = useSellerOrderStore((s) => s.loadError);
  const hydrate = useSellerOrderStore((s) => s.hydrate);
  const page = useSellerOrderStore((s) => s.page);
  const totalPages = useSellerOrderStore((s) => s.totalPages);
  const total = useSellerOrderStore((s) => s.total);
  const setPage = useSellerOrderStore((s) => s.setPage);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void hydrate({
      status: tab,
      search: debouncedSearch,
      page,
    });
  }, [debouncedSearch, hydrate, page, tab]);

  if (loading && orders.length === 0) {
    return <OrdersPageSkeleton />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description="Your confirmed marketplace orders"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => {
              setTab(item.id);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <Input
        className="mb-4"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Search order or grade"
      />
      {loadError ? (
        <EmptyState
          title="Unable to load orders"
          description="Please try again. Your session may have expired."
          action={
            <Button
              onClick={() =>
                void hydrate({ status: tab, search: debouncedSearch, page: 1 })
              }
            >
              Retry
            </Button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders have been placed yet."
          description="Your confirmed orders will appear here after a purchase request is accepted and a purchase order is created."
          action={
            <Button asChild>
              <Link href={ROUTES.OFFERS}>Browse My Offers</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Delivery Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expected Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-[#1B6EF3]"
                      href={`${ROUTES.ORDERS}/${order.id}`}
                    >
                      {order.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.gradeName}</td>
                  <td className="px-4 py-3">
                    {formatMt(order.quantityMt)}
                    {order.unit && order.unit !== "MT" ? ` ${order.unit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {formatInrShort(order.orderValue)}
                  </td>
                  <td className="px-4 py-3">{order.deliveryLocation}</td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {order.expectedDispatchDate
                      ? formatDate(order.expectedDispatchDate)
                      : order.expectedDispatchLabel || "Not scheduled"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          {total > 0 ? `${total} order${total === 1 ? "" : "s"}` : null}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || loading || total === 0}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

export function SellerOrderDetailView({ id }: { id: string }) {
  const order = useSellerOrderStore((s) => s.selectedOrder);
  const detailLoading = useSellerOrderStore((s) => s.detailLoading);
  const detailError = useSellerOrderStore((s) => s.detailError);
  const hydrateDetail = useSellerOrderStore((s) => s.hydrateDetail);

  useEffect(() => {
    void hydrateDetail(id);
  }, [hydrateDetail, id]);

  if (detailLoading && !order) {
    return <OrdersPageSkeleton />;
  }

  if (detailError) {
    return (
      <PageContainer>
        <PageHeader title="Order" description={detailError} />
        <Button onClick={() => void hydrateDetail(id)}>Retry</Button>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <PageHeader title="Order not found" />
        <Button asChild variant="outline">
          <Link href={ROUTES.ORDERS}>Back to orders</Link>
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={order.orderId}
        description={order.gradeName}
        actions={<SellerStatusBadge status={order.status} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Info label="Quantity" value={formatMt(order.quantityMt)} />
        <Info
          label="Unit price"
          value={order.pricePerKg > 0 ? `₹${order.pricePerKg}/kg` : "—"}
        />
        <Info label="Order value" value={formatInrShort(order.orderValue)} />
        <Info label="Delivery location" value={order.deliveryLocation} />
        <Info label="Payment terms" value={order.paymentTerms} />
        <Info label="Payment status" value={order.paymentStatus ?? "—"} />
        <Info
          label="Expected dispatch"
          value={
            order.expectedDispatchDate
              ? formatDate(order.expectedDispatchDate)
              : order.expectedDispatchLabel || "Not scheduled"
          }
        />
        <Info label="Proforma" value={order.proformaStatus ?? "—"} />
        <Info label="Dispatch" value={order.dispatchStatus ?? "—"} />
        <Info label="Shipment" value={order.shipmentStatus ?? "—"} />
        <Info label="Delivery" value={order.deliveryStatus ?? "—"} />
      </div>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Timeline</h2>
        <Timeline steps={order.timeline} />
        <p className="mt-3 text-xs text-slate-500">
          Status updates come from purchase order, payment, and logistics
          workflows. Manual status changes are not allowed.
        </p>
      </section>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Documents</h2>
        {order.documents.length === 0 ? (
          <p className="text-sm text-slate-500">No documents attached yet.</p>
        ) : (
          <div className="space-y-2">
            {order.documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="block text-sm text-[#1B6EF3]"
                onClick={() => toast.success(`Downloading ${doc.name}`)}
              >
                {doc.type}: {doc.name}
              </button>
            ))}
          </div>
        )}
      </section>
      <Button asChild variant="outline">
        <Link href={ROUTES.ORDERS}>Back to orders</Link>
      </Button>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
