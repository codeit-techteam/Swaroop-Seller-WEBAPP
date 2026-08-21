"use client";

import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { CreditInsuranceDrawer } from "@/components/finance";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { cn, formatCompactInr } from "@/lib/utils";
import { financeSummaryMock } from "@/mock/finance";
import { useFinanceStore } from "@/store/financeStore";
import type {
  CreditInsurancePolicy,
  CreditPolicyStatus,
} from "@/types/finance";

function utilizationPercent(row: CreditInsurancePolicy): number {
  if (row.coverAmount <= 0) return 0;
  return Math.min(100, Math.round((row.utilized / row.coverAmount) * 100));
}

function utilizationBarClass(percent: number, status: CreditPolicyStatus) {
  if (status === "EXPIRED") return "bg-slate-400";
  if (status === "EXHAUSTED" || percent >= 95) return "bg-red-500";
  if (status === "UNDER_REVIEW" || percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

function UtilizationCell({ row }: { row: CreditInsurancePolicy }) {
  const percent = utilizationPercent(row);
  const available = Math.max(0, row.coverAmount - row.utilized);

  return (
    <div className="min-w-[150px] space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium tabular-nums text-slate-700">
          {percent}% used
        </span>
        <span className="tabular-nums text-slate-400">
          {formatCompactInr(available)} left
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            utilizationBarClass(percent, row.status),
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="truncate text-[11px] tabular-nums text-slate-400">
        {formatCompactInr(row.utilized)} of {formatCompactInr(row.coverAmount)}
      </p>
    </div>
  );
}

export function CreditInsuranceView() {
  const policies = useFinanceStore((s) => s.policies);
  const [selected, setSelected] = useState<CreditInsurancePolicy | null>(null);

  const searchFields = useMemo(
    () => (row: CreditInsurancePolicy) => [
      row.policyId,
      row.buyer,
      row.insurer,
      row.coverType ?? "",
    ],
    [],
  );
  const table = useClientTable({ rows: policies, searchFields });
  const summary = financeSummaryMock;

  const insights = useMemo(() => {
    const active = policies.filter((p) => p.status === "ACTIVE");
    const atRisk = policies.filter(
      (p) =>
        p.status === "UNDER_REVIEW" ||
        p.status === "EXHAUSTED" ||
        utilizationPercent(p) >= 80,
    );
    const totalCover = policies.reduce((sum, p) => sum + p.coverAmount, 0);
    const totalUtilized = policies.reduce((sum, p) => sum + p.utilized, 0);
    const available = Math.max(0, totalCover - totalUtilized);

    const buckets = {
      active: active.length,
      underReview: policies.filter((p) => p.status === "UNDER_REVIEW").length,
      exhausted: policies.filter((p) => p.status === "EXHAUSTED").length,
      expired: policies.filter((p) => p.status === "EXPIRED").length,
    };

    return { atRisk: atRisk.length, available, buckets };
  }, [policies]);

  return (
    <>
      <OperationsShell
        className="space-y-6 py-6"
        title="Credit Insurance"
        subtitle="Buyer cover limits, utilization and policy health. Mock data only."
        kpis={[
          {
            title: "Credit Exposure",
            value: summary.creditExposure / 1_00_00_000,
            prefix: "₹",
            suffix: "Cr",
            decimals: 1,
          },
          {
            title: "Available Headroom",
            value: insights.available / 1_00_00_000,
            prefix: "₹",
            suffix: "Cr",
            decimals: 1,
          },
          {
            title: "Active Policies",
            value: insights.buckets.active,
            decimals: 0,
          },
          {
            title: "At Risk",
            value: insights.atRisk,
            decimals: 0,
            valueClassName:
              insights.atRisk > 0 ? "text-amber-600" : undefined,
          },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Active",
              hint: "In force cover",
              count: insights.buckets.active,
              tone: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
            },
            {
              label: "Under review",
              hint: "Awaiting underwriter",
              count: insights.buckets.underReview,
              tone: "border-amber-200 bg-amber-50/60 text-amber-900",
            },
            {
              label: "Exhausted",
              hint: "Limit fully drawn",
              count: insights.buckets.exhausted,
              tone: "border-red-200 bg-red-50/70 text-red-800",
            },
            {
              label: "Expired",
              hint: "Needs renewal",
              count: insights.buckets.expired,
              tone: "border-slate-200 bg-white text-slate-800",
            },
          ].map((bucket) => (
            <div
              key={bucket.label}
              className={cn(
                "rounded-xl border px-4 py-3.5 shadow-sm",
                bucket.tone,
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                {bucket.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {bucket.count}
              </p>
              <p className="mt-0.5 text-xs opacity-60">{bucket.hint}</p>
            </div>
          ))}
        </div>

        <OpsTable
          search={table.search}
          onSearch={table.setSearch}
          searchPlaceholder="Search policy, buyer or insurer"
          status={table.status}
          onStatusChange={table.setStatus}
          statusOptions={[
            "ALL",
            "ACTIVE",
            "UNDER_REVIEW",
            "EXHAUSTED",
            "EXPIRED",
          ]}
          headers={[
            "Policy",
            "Buyer",
            "Insurer",
            "Cover",
            "Utilization",
            "Valid until",
            "Status",
            "Action",
          ]}
          emptyTitle="No credit policies"
          emptyDescription="No credit insurance policies match the filters."
          page={table.page}
          totalPages={table.totalPages}
          totalItems={table.filtered.length}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          rowCount={table.paginated.length}
        >
          {table.paginated.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer transition-colors hover:bg-slate-50/80"
              onClick={() => setSelected(row)}
            >
              <TableCell className="px-4 py-4">
                <button
                  type="button"
                  className="font-medium text-[#1B6EF3] hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected(row);
                  }}
                >
                  {row.policyId}
                </button>
              </TableCell>
              <TableCell className="px-4 py-4">
                <p className="font-medium text-slate-800">{row.buyer}</p>
                {row.coverType ? (
                  <p className="text-xs text-slate-400">{row.coverType}</p>
                ) : null}
              </TableCell>
              <TableCell className="px-4 py-4 text-slate-700">
                {row.insurer}
              </TableCell>
              <TableCell className="px-4 py-4 tabular-nums font-semibold text-slate-900">
                {formatCompactInr(row.coverAmount)}
              </TableCell>
              <TableCell className="px-4 py-4">
                <UtilizationCell row={row} />
              </TableCell>
              <TableCell className="px-4 py-4 tabular-nums text-slate-600">
                {row.validUntil}
              </TableCell>
              <TableCell className="px-4 py-4">
                <OpsStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="px-4 py-4">
                <div onClick={(event) => event.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => setSelected(row)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>
      </OperationsShell>

      <CreditInsuranceDrawer
        open={Boolean(selected)}
        policy={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
