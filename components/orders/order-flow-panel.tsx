"use client";

import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";
import {
  getNextFlowAction,
  ORDER_LIFECYCLE,
  ORDER_STATUS_LABELS,
} from "@/types/orders";

interface OrderFlowPanelProps {
  order: Order;
  onPrimaryAction: () => void;
  onReject?: () => void;
  className?: string;
}

export function OrderFlowPanel({
  order,
  onPrimaryAction,
  onReject,
  className,
}: OrderFlowPanelProps) {
  const next = getNextFlowAction(order);
  const currentIdx = ORDER_LIFECYCLE.indexOf(
    order.status === "delayed" ? "in_transit" : order.status,
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Manage Order to Delivery
        </p>
        <h3 className="mt-1 text-base font-bold text-slate-900">
          Customer order lifecycle
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {order.customerRequestId
            ? `From ${order.customerRequestId} · ${order.buyerCompany}`
            : order.buyerCompany}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {ORDER_LIFECYCLE.map((step, index) => {
          const done = currentIdx > index || order.status === "delivered";
          const current = currentIdx === index && order.status !== "delivered";
          return (
            <div
              key={step}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                done && "bg-emerald-50 text-emerald-700",
                current && "bg-[#E8F1FF] text-[#1B6EF3]",
                !done && !current && "bg-slate-100 text-slate-400",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : null}
              {ORDER_STATUS_LABELS[step]}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Next step
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">{next.label}</p>
        <p className="mt-0.5 text-sm text-slate-600">{next.description}</p>
        {next.blockedReason ? (
          <p className="mt-2 text-xs font-medium text-amber-700">
            Blocked: {next.blockedReason}
          </p>
        ) : null}
      </div>

      {next.action !== "none" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {order.status === "new" && onReject ? (
            <Button
              variant="outline"
              className="h-10 border-red-300 text-red-600 hover:bg-red-50"
              onClick={onReject}
            >
              Reject
            </Button>
          ) : null}
          <Button
            className="h-10 gap-2 bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={onPrimaryAction}
          >
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
