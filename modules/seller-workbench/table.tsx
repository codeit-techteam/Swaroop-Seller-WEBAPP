"use client";

import { Eye, FolderOpen } from "lucide-react";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMt } from "@/lib/seller/format";
import { formatOpsValue } from "@/lib/seller-ops";
import { formatDate } from "@/lib/utils";
import type { ProcurementRecord } from "@/types/seller-ops";

export function ProcurementTable({
  rows,
  onView,
}: {
  rows: ProcurementRecord[];
  onView: (row: ProcurementRecord) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1280px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Reference ID</th>
            <th className="px-4 py-3">Buyer</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Current Stage</th>
            <th className="px-4 py-3">Order Value</th>
            <th className="px-4 py-3">Payment Status</th>
            <th className="px-4 py-3">Dispatch Status</th>
            <th className="px-4 py-3">Last Updated</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-slate-100 hover:bg-slate-50/80 ${
                row.overdue || row.delayed ? "bg-red-50/40" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium">{row.purchaseRequestId}</td>
              <td className="px-4 py-3">{row.buyerName}</td>
              <td className="px-4 py-3">{row.productName}</td>
              <td className="px-4 py-3">{row.gradeName}</td>
              <td className="px-4 py-3">{formatMt(row.quantityMt)}</td>
              <td className="px-4 py-3">
                <SellerStatusBadge status={row.currentStage} />
              </td>
              <td className="px-4 py-3 tabular-nums">
                {formatOpsValue(row.orderValue)}
              </td>
              <td className="px-4 py-3">
                <SellerStatusBadge status={row.paymentStatus} />
              </td>
              <td className="px-4 py-3">
                <SellerStatusBadge status={row.dispatchStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(row.lastUpdated)}
              </td>
              <td className="px-4 py-3">
                <SellerStatusBadge status={row.priority} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`View ${row.purchaseRequestId}`}
                        onClick={() => onView(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Open ${row.purchaseRequestId}`}
                        onClick={() => onView(row)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open</TooltipContent>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
