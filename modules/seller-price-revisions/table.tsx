"use client";

import { Eye, MessageSquare } from "lucide-react";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPricePerKg } from "@/lib/seller/format";
import {
  formatDeltaPercent,
  formatOpsValue,
  priceDelta,
} from "@/lib/seller-ops";
import { formatDate } from "@/lib/utils";
import type { PriceRevision } from "@/types/seller-ops";

export function PriceRevisionTable({
  rows,
  onView,
  onRespond,
}: {
  rows: PriceRevision[];
  onView: (row: PriceRevision) => void;
  onRespond: (row: PriceRevision) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1280px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Request ID</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Buyer</th>
            <th className="px-4 py-3">Original Price</th>
            <th className="px-4 py-3">Requested Price</th>
            <th className="px-4 py-3">Difference</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Total Value</th>
            <th className="px-4 py-3">Requested On</th>
            <th className="px-4 py-3">Response Deadline</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta = priceDelta(row.originalPrice, row.requestedPrice);
            const actionable =
              row.status === "PENDING" ||
              row.status === "AWAITING_RESPONSE" ||
              row.status === "COUNTER_OFFER";
            return (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{row.id}</td>
                <td className="px-4 py-3">{row.productName}</td>
                <td className="px-4 py-3">{row.gradeName}</td>
                <td className="px-4 py-3">{row.buyerName}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPricePerKg(row.originalPrice)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPricePerKg(row.requestedPrice)}
                </td>
                <td
                  className={`px-4 py-3 tabular-nums ${
                    delta.percent < 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {formatDeltaPercent(delta.percent)}
                </td>
                <td className="px-4 py-3 tabular-nums">{row.quantityMt} MT</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatOpsValue(row.totalValue)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(row.requestedOn)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(row.deadline)}
                </td>
                <td className="px-4 py-3">
                  <SellerStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`View ${row.id}`}
                          onClick={() => onView(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    {actionable ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Respond to ${row.id}`}
                            onClick={() => onRespond(row)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Respond</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
