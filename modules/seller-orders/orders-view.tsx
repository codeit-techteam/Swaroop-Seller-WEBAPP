"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Timeline } from "@/components/status/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { formatInrShort, formatMt } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
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
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const orders = useSellerOrderStore((s) => s.orders);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const rows = useMemo(() => {
    return orders.filter((order) => {
      if (order.locationId !== locationId) return false;
      if (tab !== "all" && order.status !== tab) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        order.orderId.toLowerCase().includes(query) ||
        order.gradeName.toLowerCase().includes(query)
      );
    });
  }, [locationId, orders, search, tab]);
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));

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
      {rows.length === 0 ? (
        <EmptyState
          title="No orders have been placed yet."
          description="Your confirmed orders will appear here."
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
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Delivery Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expected Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-[#1B6EF3]"
                      href={`${ROUTES.ORDERS}/${order.id}`}
                    >
                      {order.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.buyerRef}</td>
                  <td className="px-4 py-3">{order.gradeName}</td>
                  <td className="px-4 py-3">{formatMt(order.quantityMt)}</td>
                  <td className="px-4 py-3">
                    {formatInrShort(order.orderValue)}
                  </td>
                  <td className="px-4 py-3">{order.deliveryLocation}</td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">{formatDate(order.orderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </PageContainer>
  );
}

export function SellerOrderDetailView({ id }: { id: string }) {
  const order = useSellerOrderStore((s) => s.getOrderById(id));
  const advanceOrder = useSellerOrderStore((s) => s.advanceOrder);

  if (!order) {
    return (
      <PageContainer>
        <PageHeader title="Order not found" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={order.orderId}
        description={`${order.gradeName} · ${order.buyerRef}`}
        actions={<SellerStatusBadge status={order.status} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Info label="Quantity" value={formatMt(order.quantityMt)} />
        <Info label="Price" value={`₹${order.pricePerKg}/kg`} />
        <Info label="Order value" value={formatInrShort(order.orderValue)} />
        <Info label="Buyer reference" value={order.buyerRef} />
        <Info label="Seller location" value={order.locationName} />
        <Info label="Delivery location" value={order.deliveryLocation} />
        <Info label="Payment terms" value={order.paymentTerms} />
      </div>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Timeline</h2>
        <Timeline steps={order.timeline} />
        {order.status !== "delivered" && order.status !== "cancelled" ? (
          <Button
            className="mt-4"
            onClick={() => {
              advanceOrder(order.id);
              toast.success("Order updated");
            }}
          >
            Advance status
          </Button>
        ) : null}
      </section>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Documents</h2>
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
      </section>
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
