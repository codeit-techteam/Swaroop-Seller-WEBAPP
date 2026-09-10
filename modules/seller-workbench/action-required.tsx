"use client";

import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  IndianRupee,
  ScrollText,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AlertKind, ProcurementRecord } from "@/types/seller-ops";

const CARDS: {
  kind: AlertKind;
  title: string;
  description: (count: number) => string;
  icon: typeof IndianRupee;
  tone: string;
}[] = [
  {
    kind: "PRICE_REVISION_DUE_TODAY",
    title: "Price Revision Due Today",
    description: (count) =>
      `${count} price revision${count === 1 ? "" : "s"} need a response today.`,
    icon: IndianRupee,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    kind: "PAYMENT_PENDING",
    title: "Payment Pending",
    description: (count) =>
      `${count} order${count === 1 ? "" : "s"} are awaiting payment confirmation.`,
    icon: ScrollText,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    kind: "VEHICLE_SLOT_MISSING",
    title: "Vehicle Slot Missing",
    description: (count) =>
      `${count} confirmed order${count === 1 ? "" : "s"} do not have a vehicle slot.`,
    icon: Truck,
    tone: "bg-red-50 text-red-700",
  },
  {
    kind: "PO_AWAITING_CONFIRMATION",
    title: "PO Awaiting Confirmation",
    description: (count) =>
      `${count} purchase order${count === 1 ? "" : "s"} still need acknowledgement.`,
    icon: CalendarClock,
    tone: "bg-blue-50 text-[#1B6EF3]",
  },
  {
    kind: "DOCUMENTS_MISSING",
    title: "Documents Missing",
    description: (count) =>
      `${count} record${count === 1 ? "" : "s"} are missing required documents.`,
    icon: FileWarning,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    kind: "DISPATCH_DELAYED",
    title: "Dispatch Delayed",
    description: (count) =>
      `${count} dispatch${count === 1 ? "" : "es"} are running behind schedule.`,
    icon: AlertTriangle,
    tone: "bg-red-50 text-red-700",
  },
];

export function ActionRequired({
  rows,
  onView,
}: {
  rows: ProcurementRecord[];
  onView: (kind: AlertKind) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Action required</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => {
          const count = rows.filter((row) => row.alerts.includes(card.kind)).length;
          const Icon = card.icon;
          return (
            <div
              key={card.kind}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="mt-1 text-2xl font-semibold">{count}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {card.description(count)}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onView(card.kind)}
              >
                View
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
