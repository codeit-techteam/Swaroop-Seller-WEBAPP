"use client";

import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Star,
  Tag,
  Truck,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from "@/store/analyticsStore";
import type { RevenueFilterPeriod } from "@/types/analytics";

const PERIOD_OPTIONS: { id: RevenueFilterPeriod; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "3m", label: "3 Months" },
  { id: "1y", label: "1 Year" },
];

const PERIOD_AXIS: Record<RevenueFilterPeriod, string[]> = {
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30d": Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  "3m": [
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "W6",
    "W7",
    "W8",
    "W9",
    "W10",
    "W11",
    "W12",
  ],
  "1y": [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

function MetricTile({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "navy" | "success";
  icon?: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight",
              tone === "navy" && "text-[#0B1F3A]",
              tone === "success" && "text-emerald-600",
              tone === "default" && "text-slate-900",
            )}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#1B6EF3]">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <PageContainer className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
    </PageContainer>
  );
}

export function SellerAnalyticsView() {
  const snapshot = useAnalyticsStore((s) => s.snapshot);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const revenuePeriod = useAnalyticsStore((s) => s.revenuePeriod);
  const bootstrap = useAnalyticsStore((s) => s.bootstrap);
  const setRevenuePeriod = useAnalyticsStore((s) => s.setRevenuePeriod);
  const refresh = useAnalyticsStore((s) => s.refresh);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const chartData = useMemo(() => {
    if (!snapshot) return [];
    const values = snapshot.revenue.filters[revenuePeriod];
    const labels = PERIOD_AXIS[revenuePeriod];
    return values.map((value, index) => ({
      label: labels[index] ?? `${index + 1}`,
      revenue: value,
    }));
  }, [revenuePeriod, snapshot]);

  if (isLoading || !snapshot) {
    return <AnalyticsSkeleton />;
  }

  const financialRows = [
    { label: "Pending Settlement", value: snapshot.settlement.pending },
    { label: "Released", value: snapshot.settlement.released },
    { label: "TDS", value: snapshot.settlement.tds },
    { label: "Platform Fees", value: snapshot.settlement.platformFees },
    {
      label: "Net Earnings",
      value: snapshot.settlement.netEarnings,
      emphasize: true,
    },
  ];

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revenue, orders, warehouses, shipments and settlements — aligned
            with the seller mobile app.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => refresh()}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Today's Revenue"
          value={snapshot.revenue.today}
          tone="navy"
          icon={Banknote}
        />
        <MetricTile
          label="Monthly Revenue"
          value={snapshot.revenue.monthly}
          tone="navy"
          icon={Banknote}
        />
        <MetricTile
          label="Orders Completed"
          value={String(snapshot.orders.completed)}
          icon={ClipboardList}
        />
        <MetricTile
          label="Active Products"
          value={String(snapshot.products.active)}
          icon={Package}
        />
        <MetricTile
          label="Inventory Value"
          value={snapshot.inventory.value}
          tone="navy"
          icon={Warehouse}
        />
        <MetricTile
          label="Offers Live"
          value={String(snapshot.inventory.offersLive)}
          icon={Tag}
        />
        <MetricTile
          label="Conversion Rate"
          value={snapshot.inventory.conversionRate}
          tone="success"
          icon={Percent}
        />
        <MetricTile
          label="Customer Rating"
          value={snapshot.inventory.customerRating}
          tone="success"
          icon={Star}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Revenue Graph
            </h2>
            <p className="text-xs text-slate-500">₹ Lakhs</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => {
              const active = option.id === revenuePeriod;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRevenuePeriod(option.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                    active
                      ? "bg-[#0B1F3A] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B1F3A" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#0B1F3A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                formatter={(value) => [
                  `₹${typeof value === "number" ? value : Number(value)}L`,
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0B1F3A"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{ r: 5, fill: "#0B1F3A" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Orders Analytics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {snapshot.orders.breakdown.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {order.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {order.count}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {order.percentage}% of total
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Top Selling Products
          </h2>
          <div className="space-y-3">
            {snapshot.products.topSelling.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="font-semibold text-slate-900">{product.name}</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Orders</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {product.orders}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="mt-0.5 font-semibold text-[#0B1F3A]">
                      {product.revenue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Growth</p>
                    <p
                      className={cn(
                        "mt-0.5 font-semibold",
                        product.growthPercent >= 0
                          ? "text-emerald-600"
                          : "text-red-600",
                      )}
                    >
                      {product.growthPercent >= 0 ? "+" : ""}
                      {product.growthPercent}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Warehouse Analytics
          </h2>
          <div className="space-y-4">
            {snapshot.warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="rounded-lg border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">
                    {warehouse.name}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0B1F3A]">
                    {warehouse.capacityPercent}% Capacity
                  </p>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0B1F3A]"
                    style={{
                      width: `${Math.min(Math.max(warehouse.capacityPercent, 0), 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Available Stock</p>
                    <p className="mt-0.5 font-semibold text-[#0B1F3A]">
                      {warehouse.availableStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reserved</p>
                    <p className="mt-0.5 font-semibold text-[#0B1F3A]">
                      {warehouse.reserved}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Shipment Analytics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Live"
            value={String(snapshot.shipments.live)}
            icon={Truck}
          />
          <MetricTile
            label="Delayed"
            value={String(snapshot.shipments.delayed)}
            icon={Truck}
          />
          <MetricTile
            label="Delivered"
            value={String(snapshot.shipments.delivered)}
            icon={Truck}
          />
          <MetricTile
            label="Average ETA"
            value={snapshot.shipments.averageEta}
          />
        </div>
        <div className="mt-3">
          <MetricTile
            label="Average Transit Time"
            value={snapshot.shipments.averageTransitTime}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Financial Summary
          </h2>
          <div className="divide-y divide-slate-100">
            {financialRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <p
                  className={cn(
                    "text-sm text-slate-600",
                    row.emphasize && "font-semibold text-slate-900",
                  )}
                >
                  {row.label}
                </p>
                <p className="text-base font-semibold text-[#0B1F3A]">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Recent Activities
          </h2>
          <ol className="space-y-0">
            {snapshot.activities.map((activity, index) => (
              <li key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F1FF] text-[#0B1F3A]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  {index < snapshot.activities.length - 1 ? (
                    <div className="my-1 w-px flex-1 bg-slate-200" />
                  ) : null}
                </div>
                <div
                  className={cn(
                    "pb-5",
                    index === snapshot.activities.length - 1 && "pb-0",
                  )}
                >
                  <p className="font-semibold text-slate-900">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {activity.subtitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activity.timestamp}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: ROUTES.PRODUCTS_NEW, label: "Add Product", icon: Plus },
            { href: ROUTES.OFFERS_NEW, label: "Create Offer", icon: Tag },
            {
              href: ROUTES.INVENTORY,
              label: "Update Inventory",
              icon: Warehouse,
            },
            { href: ROUTES.ORDERS, label: "View Orders", icon: Truck },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#1B6EF3]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#0B1F3A]">
                <action.icon className="h-4 w-4" />
              </div>
              <span className="pt-2 text-sm font-semibold text-slate-900">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
