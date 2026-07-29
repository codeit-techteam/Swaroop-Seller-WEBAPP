"use client";

import { AlertTriangle, Box, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AlertSeverity, InventoryAlert } from "@/types/performance";

interface LowStockAlertCardProps {
  alerts: InventoryAlert[];
}

function severityIcon(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return AlertTriangle;
    default:
      return Package;
  }
}

function severityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    default:
      return "Low";
  }
}

export function LowStockAlertCard({ alerts }: LowStockAlertCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Low Stock Alerts
        </h2>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts"
          description="All inventory levels are within healthy thresholds."
          className="border-0 bg-transparent py-10"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => {
            const Icon = severityIcon(alert.severity);
            const isCritical = alert.severity === "critical";

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isCritical ? "bg-red-50" : "bg-slate-100",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isCritical ? "text-red-500" : "text-slate-500",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {alert.product}
                  </p>
                  <p className="text-xs text-slate-500">
                    {alert.remainingStock} {alert.unit} Remaining
                    {isCritical ? (
                      <span className="ml-1 font-medium text-red-500">
                        ({severityLabel(alert.severity)})
                      </span>
                    ) : null}
                  </p>
                </div>
                <Button
                  size="sm"
                  className={cn(
                    "h-7 shrink-0 px-3 text-[10px] font-bold uppercase tracking-wide",
                    isCritical
                      ? "bg-[#0B1F3A] text-white hover:bg-[#122846]"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                  variant={isCritical ? "default" : "outline"}
                  onClick={() => router.push(ROUTES.INVENTORY)}
                >
                  Replenish
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-slate-100 p-3">
        <Button
          variant="outline"
          className="w-full border-slate-200 text-sm font-medium text-slate-700"
          asChild
        >
          <Link href={ROUTES.INVENTORY}>
            <Box className="mr-2 h-4 w-4" />
            Manage Full Inventory
          </Link>
        </Button>
      </div>
    </div>
  );
}
