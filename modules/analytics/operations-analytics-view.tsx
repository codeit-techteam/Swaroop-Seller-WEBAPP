"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OperationsShell } from "@/components/operations";
import { cn } from "@/lib/utils";
import {
  analyticsKpisMock,
  analyticsSeriesMock,
} from "@/mock/operations-analytics";

export function OperationsAnalyticsView() {
  return (
    <OperationsShell
      title="Operations Analytics"
      subtitle="Frontend-only performance view for marketplace, procurement and dispatch."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {analyticsKpisMock.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">{kpi.value}</p>
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                kpi.positive ? "text-emerald-600" : "text-red-600",
              )}
            >
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Revenue, orders and dispatch trend
        </h2>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsSeriesMock}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue (Cr)"
                stroke="#0B1F3A"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#1B6EF3"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="dispatch"
                name="Dispatch %"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </OperationsShell>
  );
}
