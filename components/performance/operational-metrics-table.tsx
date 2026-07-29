"use client";

import { ArrowDown, ArrowUp, MoreHorizontal, Search } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/performance/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  MetricStatus,
  OperationalMetric,
  PerformanceSortKey,
} from "@/types/performance";

interface OperationalMetricsTableProps {
  metrics: OperationalMetric[];
  search: string;
  statusFilter: MetricStatus | "all";
  sortKey: PerformanceSortKey;
  sortDirection: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onStatusChange: (status: MetricStatus | "all") => void;
  onSort: (key: PerformanceSortKey) => void;
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) return null;
  return direction === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}

function trendColor(metric: OperationalMetric, trend: number): string {
  if (metric.name.toLowerCase().includes("cancellation")) {
    return trend > 0 ? "text-red-500" : "text-[#1B6EF3]";
  }
  if (metric.name.toLowerCase().includes("late shipment")) {
    return trend < 0 ? "text-[#1B6EF3]" : "text-red-500";
  }
  return trend >= 0 ? "text-[#1B6EF3]" : "text-red-500";
}

export function OperationalMetricsTable({
  metrics,
  search,
  statusFilter,
  sortKey,
  sortDirection,
  onSearchChange,
  onStatusChange,
  onSort,
}: OperationalMetricsTableProps) {
  const headerClass =
    "cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Detailed Operational Metrics
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search metrics..."
              className="h-8 w-[180px] border-slate-200 pl-8 text-xs"
              aria-label="Search operational metrics"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-[120px] border-slate-200 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="optimal">Optimal</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <EmptyState
          title="No metrics found"
          description="Try adjusting your search or filter criteria."
          className="border-0 bg-transparent"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headerClass} onClick={() => onSort("name")}>
                Metric Name
                <SortIcon
                  active={sortKey === "name"}
                  direction={sortDirection}
                />
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => onSort("status")}
              >
                Status
                <SortIcon
                  active={sortKey === "status"}
                  direction={sortDirection}
                />
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => onSort("currentValue")}
              >
                Current Value
                <SortIcon
                  active={sortKey === "currentValue"}
                  direction={sortDirection}
                />
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => onSort("target")}
              >
                Target
                <SortIcon
                  active={sortKey === "target"}
                  direction={sortDirection}
                />
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => onSort("trend")}
              >
                Trend
                <SortIcon
                  active={sortKey === "trend"}
                  direction={sortDirection}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow
                key={metric.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                <TableCell className="font-medium text-slate-800">
                  {metric.name}
                </TableCell>
                <TableCell>
                  <StatusBadge status={metric.status} />
                </TableCell>
                <TableCell className="tabular-nums font-semibold text-slate-800">
                  {metric.currentValue.toFixed(1)}
                  {metric.unit}
                </TableCell>
                <TableCell className="tabular-nums text-slate-500">
                  {metric.target.toFixed(1)}
                  {metric.unit}
                </TableCell>
                <TableCell
                  className={cn(
                    "tabular-nums font-semibold",
                    trendColor(metric, metric.trend),
                  )}
                >
                  {metric.trend > 0 ? "+" : ""}
                  {metric.trend.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
