"use client";

import { Boxes, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface RegistrationBillingCardProps {
  order: Order;
  className?: string;
}

export function RegistrationBillingCard({
  order,
  className,
}: RegistrationBillingCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Registration
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {order.billing.registration}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Billing Address
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {order.billing.billingAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductSpecCardProps {
  order: Order;
  className?: string;
}

export function ProductSpecCard({ order, className }: ProductSpecCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Boxes className="h-4 w-4 text-[#1B6EF3]" />
        <h3 className="text-sm font-bold text-slate-900">
          Product Specification
        </h3>
      </div>

      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#1B6EF3]">
          <Boxes className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900">
            {order.productName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {order.gradeSpecs.application} Grade • MFI:{" "}
            {order.gradeSpecs.mfi.replace(" g/10min", "")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Quantity
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {order.quantityMt.toFixed(2)} MT
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Unit Price
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatInr(order.unitPrice).replace(".00", "")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Packaging
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {order.packaging}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FinancialOverviewCardProps {
  order: Order;
  className?: string;
}

export function FinancialOverviewCard({
  order,
  className,
}: FinancialOverviewCardProps) {
  const { financials } = order;
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-bold text-slate-900">Financial Overview</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Subtotal (Excl. Tax)</dt>
          <dd className="font-semibold tabular-nums text-slate-800">
            {formatInr(financials.subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">GST @ {financials.gstRate}%</dt>
          <dd className="font-semibold tabular-nums text-slate-800">
            {formatInr(financials.gstAmount)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Freight Charges</dt>
          <dd className="font-semibold tabular-nums text-slate-800">
            {formatInr(financials.freight)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Insurance</dt>
          <dd className="font-semibold tabular-nums text-slate-800">
            {formatInr(financials.insurance)}
          </dd>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-base font-bold text-slate-900">
              Total Landed Cost
            </dt>
            <dd className="text-lg font-bold tabular-nums text-[#1B6EF3]">
              {formatInr(financials.totalLandedCost)}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}

interface PaymentRiskCardProps {
  order: Order;
  className?: string;
}

export function PaymentRiskCard({ order, className }: PaymentRiskCardProps) {
  const { paymentRisk } = order;
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-bold text-slate-900">Payment & Risk</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3">
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            ✓
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Credit Status
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              {paymentRisk.creditStatus}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
            Trade Insurance
          </p>
          <p className="mt-0.5 text-sm font-semibold text-sky-900">
            {paymentRisk.tradeInsurance}
          </p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
            Standard Terms
          </p>
          <p className="mt-0.5 text-sm font-semibold text-sky-900">
            {paymentRisk.paymentTermsLabel}
          </p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
            Incoterms
          </p>
          <p className="mt-0.5 text-sm font-semibold text-sky-900">
            {paymentRisk.incoterms}
          </p>
        </div>
      </div>
    </div>
  );
}
