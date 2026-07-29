"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, FileWarning, ShieldAlert, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WarningBannerProps {
  hasExpired: boolean;
  hasPending: boolean;
  hasRejected: boolean;
  hasRenewalRequired: boolean;
  onFilterExpired: () => void;
  onFilterPending: () => void;
  onFilterRejected: () => void;
  onFilterExpiring: () => void;
  className?: string;
}

export function WarningBanner({
  hasExpired,
  hasPending,
  hasRejected,
  hasRenewalRequired,
  onFilterExpired,
  onFilterPending,
  onFilterRejected,
  onFilterExpiring,
  className,
}: WarningBannerProps) {
  const banners = [
    hasExpired
      ? {
          key: "expired",
          icon: FileWarning,
          title: "Expired Documents",
          message:
            "One or more certifications have expired. Upload renewals to avoid service suspension.",
          actionLabel: "View Expired",
          onAction: onFilterExpired,
          className: "border-red-200 bg-red-50 text-red-800",
          iconClass: "text-red-600",
        }
      : null,
    hasRenewalRequired
      ? {
          key: "renewal",
          icon: Timer,
          title: "Renewal Required",
          message:
            "Documents are approaching expiry. Renew before the deadline to maintain Tier eligibility.",
          actionLabel: "View Expiring",
          onAction: onFilterExpiring,
          className: "border-orange-200 bg-orange-50 text-orange-900",
          iconClass: "text-orange-600",
        }
      : null,
    hasPending
      ? {
          key: "pending",
          icon: AlertTriangle,
          title: "Pending Verification",
          message:
            "Some documents are awaiting admin review. Trading eligibility may be limited until verified.",
          actionLabel: "View Pending",
          onAction: onFilterPending,
          className: "border-sky-200 bg-sky-50 text-sky-900",
          iconClass: "text-sky-600",
        }
      : null,
    hasRejected
      ? {
          key: "rejected",
          icon: ShieldAlert,
          title: "Rejected Documents",
          message:
            "Admin rejected one or more submissions. Review remarks and upload a corrected version.",
          actionLabel: "View Rejected",
          onAction: onFilterRejected,
          className: "border-rose-200 bg-rose-50 text-rose-900",
          iconClass: "text-rose-600",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    message: string;
    actionLabel: string;
    onAction: () => void;
    className: string;
    iconClass: string;
  }>;

  if (banners.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence>
        {banners.slice(0, 2).map((banner) => {
          const Icon = banner.icon;
          return (
            <motion.div
              key={banner.key}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                banner.className,
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", banner.iconClass)}
                />
                <div>
                  <p className="text-sm font-semibold">{banner.title}</p>
                  <p className="mt-0.5 text-xs opacity-90">{banner.message}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-current/20 bg-white/70"
                onClick={banner.onAction}
              >
                {banner.actionLabel}
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
