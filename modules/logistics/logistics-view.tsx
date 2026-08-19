"use client";

import { Ship, Truck, Warehouse } from "lucide-react";
import Link from "next/link";

import { OperationsShell } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function LogisticsHubView() {
  return (
    <OperationsShell
      title="Logistics"
      subtitle="Unified operations hub for dispatch, shipment tracking and warehouse slots."
      kpis={[
        { title: "Dispatch pending", value: 18 },
        { title: "In transit", value: 11 },
        { title: "Slots today", value: 7 },
        { title: "Exceptions", value: 3, valueClassName: "text-red-600" },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Dispatch Operations",
            href: ROUTES.DISPATCH,
            icon: Truck,
            copy: "Assign vehicles, generate e-way bills and release shipments.",
          },
          {
            title: "Shipment Tracking",
            href: ROUTES.SHIPMENT_TRACKING,
            icon: Ship,
            copy: "Live movement, POD capture and exception handling.",
          },
          {
            title: "Inventory Reservations",
            href: ROUTES.INVENTORY_RESERVATIONS,
            icon: Warehouse,
            copy: "Reserved stock against confirmed orders and offers.",
          },
        ].map((card) => (
          <div
            key={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <card.icon className="h-5 w-5 text-[#1B6EF3]" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{card.copy}</p>
            <Button asChild className="mt-4 bg-[#0B1F3A] hover:bg-[#122846]">
              <Link href={card.href}>Open module</Link>
            </Button>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
