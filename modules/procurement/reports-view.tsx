"use client";

import { type ReactElement, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { downloadFile, formatCompactInr, formatDate, formatNumber } from "@/lib/utils";
import { BUYERS, COMMODITIES, WAREHOUSES } from "@/modules/procurement/catalog";
import { csvEscape, potentialSavings } from "@/modules/procurement/selectors";
import { useProcurementStore } from "@/store/procurementStore";
import { useUsersStore } from "@/store/usersStore";
import type { ProcurementItem } from "@/types/procurement";

type RangeKey = "today" | "7d" | "30d" | "quarter" | "all";

const PIE_COLORS = ["#1B6EF3", "#0B1F3A", "#059669", "#F59E0B", "#EF4444", "#8B5CF6"];

function inRange(item: ProcurementItem, range: RangeKey): boolean {
  const created = new Date(item.createdAt);
  const now = new Date("2026-08-19T23:59:59.000Z");
  if (range === "all") return true;
  if (range === "today") {
    return created.toISOString().slice(0, 10) === "2026-08-19";
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - days);
  return created >= from && created <= now;
}

export function ProcurementReportsView() {
  const items = useProcurementStore((s) => s.items);
  const suppliers = useUsersStore((s) => s.suppliers);
  const [range, setRange] = useState<RangeKey>("30d");
  const [commodity, setCommodity] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [buyer, setBuyer] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [warehouse, setWarehouse] = useState("ALL");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (!inRange(item, range)) return false;
        if (commodity !== "ALL" && item.commodity !== commodity) return false;
        if (supplier !== "ALL" && item.supplier !== supplier) return false;
        if (buyer !== "ALL" && item.buyer !== buyer) return false;
        if (status !== "ALL" && item.status !== status) return false;
        if (warehouse !== "ALL" && item.warehouse !== warehouse) return false;
        return true;
      }),
    [buyer, commodity, items, range, status, supplier, warehouse],
  );

  const kpis = useMemo(() => {
    const total = filtered.reduce((sum, item) => sum + item.estimatedCost, 0);
    const approved = filtered.filter(
      (item) =>
        item.status === "APPROVED" ||
        item.status === "PO_CREATED" ||
        item.status === "COMPLETED",
    ).length;
    const pending = filtered.filter(
      (item) => item.status === "PENDING_APPROVAL" || item.status === "UNDER_REVIEW",
    ).length;
    const avg =
      filtered.length === 0
        ? 0
        : Math.round(
            filtered.reduce((sum, item) => sum + item.processingHours, 0) /
              filtered.length,
          );
    const supplierCount = new Set(filtered.map((item) => item.supplier)).size;
    const savings = filtered.reduce((sum, item) => sum + potentialSavings(item), 0);
    return { total, approved, pending, avg, supplierCount, savings };
  }, [filtered]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => {
      const key = formatDate(item.createdAt, "dd MMM");
      map.set(key, (map.get(key) ?? 0) + item.estimatedCost / 1_00_00_000);
    });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value: Number(value.toFixed(2)) }));
  }, [filtered]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => {
      map.set(item.status, (map.get(item.status) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byCommodity = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => {
      map.set(
        item.commodity,
        (map.get(item.commodity) ?? 0) + item.estimatedCost / 1_00_000,
      );
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(1)),
    }));
  }, [filtered]);

  const bySupplier = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => {
      map.set(
        item.supplier,
        (map.get(item.supplier) ?? 0) + item.estimatedCost / 1_00_00_000,
      );
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [filtered]);

  const savingsTrend = useMemo(
    () =>
      filtered.map((item) => ({
        id: item.requestId,
        savings: potentialSavings(item) / 1_00_000,
      })),
    [filtered],
  );

  const processingTrend = useMemo(
    () =>
      filtered.map((item) => ({
        id: item.requestId,
        hours: item.processingHours,
      })),
    [filtered],
  );

  const exportCsv = () => {
    const header = [
      "PR/PO ID",
      "Commodity",
      "Buyer",
      "Supplier",
      "Quantity",
      "Value",
      "Status",
      "Created Date",
      "Approved Date",
      "Processing Time",
    ];
    const rows = filtered.map((item) =>
      [
        item.requestId,
        `${item.commodity} ${item.grade}`,
        item.buyer,
        item.supplier,
        `${item.quantityMt} ${item.quantityUnit}`,
        item.estimatedCost,
        item.status,
        formatDate(item.createdAt),
        item.approvedAt ? formatDate(item.approvedAt) : "",
        `${item.processingHours} hrs`,
      ].map(csvEscape).join(","),
    );
    downloadFile(
      [header.join(","), ...rows].join("\n"),
      "procurement-report.csv",
      "text/csv;charset=utf-8",
    );
    toast.success("Report exported successfully.");
  };

  return (
    <OperationsShell
      title="Procurement Reports"
      subtitle="Monitor procurement performance, spend, supplier activity and request processing."
      actions={
        <>
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button className="bg-[#1B6EF3] hover:bg-[#1558C8]" onClick={exportCsv}>
            Export Report
          </Button>
        </>
      }
      kpis={[
        {
          title: "Total Procurement Value",
          value: kpis.total / 1_00_00_000,
          prefix: "₹",
          suffix: "Cr",
          decimals: 1,
        },
        { title: "Approved POs", value: kpis.approved },
        { title: "Pending Requests", value: kpis.pending },
        { title: "Average Processing Time", value: kpis.avg, suffix: "hrs" },
        { title: "Supplier Count", value: kpis.supplierCount },
        {
          title: "Negotiation Savings",
          value: kpis.savings / 1_00_000,
          prefix: "₹",
          suffix: "L",
          decimals: 1,
        },
      ]}
    >
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        {(
          [
            ["today", "Today"],
            ["7d", "Last 7 Days"],
            ["30d", "Last 30 Days"],
            ["quarter", "This Quarter"],
            ["all", "Custom Range"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={range === key ? "default" : "outline"}
            className={range === key ? "bg-[#1B6EF3] hover:bg-[#1558C8]" : ""}
            onClick={() => setRange(key)}
          >
            {label}
          </Button>
        ))}
        <Select value={commodity} onValueChange={setCommodity}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Commodity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All commodities</SelectItem>
            {COMMODITIES.map((row) => (
              <SelectItem key={row} value={row}>
                {row}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All suppliers</SelectItem>
            {suppliers.map((row) => (
              <SelectItem key={row.id} value={row.name}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={buyer} onValueChange={setBuyer}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All buyers</SelectItem>
            {BUYERS.map((row) => (
              <SelectItem key={row.name} value={row.name}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PO_CREATED">PO Created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All warehouses</SelectItem>
            {WAREHOUSES.map((row) => (
              <SelectItem key={row} value={row}>
                {row}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Procurement Value Trend">
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="value" name="Value (Cr)" stroke="#1B6EF3" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>
        <ChartCard title="Requests by Status">
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
              {byStatus.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard title="Spend by Commodity">
          <BarChart data={byCommodity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" name="Spend (L)" fill="#0B1F3A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Supplier-wise Procurement Value">
          <BarChart data={bySupplier} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="name" width={120} fontSize={11} />
            <Tooltip />
            <Bar dataKey="value" name="Value (Cr)" fill="#1B6EF3" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Negotiation Savings">
          <BarChart data={savingsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="id" fontSize={11} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="savings" name="Savings (L)" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Processing Time Trend">
          <LineChart data={processingTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="id" fontSize={11} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" name="Hours" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ChartCard>
      </div>

      <OpsTable
        hideControls
        search=""
        onSearch={() => undefined}
        status="ALL"
        onStatusChange={() => undefined}
        statusOptions={["ALL"]}
        headers={[
          "PR/PO ID",
          "Commodity",
          "Buyer",
          "Supplier",
          "Quantity",
          "Value",
          "Status",
          "Created Date",
          "Approved Date",
          "Processing Time",
        ]}
        emptyTitle="No procurement requests found"
        emptyDescription="Adjust filters to view report rows."
        page={1}
        totalPages={1}
        totalItems={filtered.length}
        pageSize={filtered.length || 1}
        onPageChange={() => undefined}
        rowCount={filtered.length}
      >
        {filtered.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium text-[#1B6EF3]">{item.requestId}</TableCell>
            <TableCell>
              {item.commodity} {item.grade}
            </TableCell>
            <TableCell>{item.buyer}</TableCell>
            <TableCell>{item.supplier}</TableCell>
            <TableCell>
              {formatNumber(item.quantityMt)} {item.quantityUnit}
            </TableCell>
            <TableCell>{formatCompactInr(item.estimatedCost)}</TableCell>
            <TableCell>
              <OpsStatusBadge status={item.status} />
            </TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell>{item.approvedAt ? formatDate(item.approvedAt) : "—"}</TableCell>
            <TableCell>{item.processingHours} hrs</TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
