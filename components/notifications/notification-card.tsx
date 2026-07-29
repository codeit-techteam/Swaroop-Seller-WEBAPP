"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  ShieldAlert,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification, NotificationCategory } from "@/types/notifications";

const CATEGORY_ICONS = {
  "Purchase Request": ShoppingBag,
  "Offer Approved": CheckCircle2,
  "Offer Changes Requested": FileText,
  "Inventory Reserved": Package,
  "Dispatch Scheduled": Truck,
  "Shipment Delayed": Truck,
  "Settlement Released": Wallet,
  "Compliance Alert": ShieldAlert,
  "Document Expiring": ShieldAlert,
  "System Update": Bell,
} as const satisfies Record<NotificationCategory, typeof ShoppingBag>;

function NotificationCategoryIcon({
  category,
}: {
  category: NotificationCategory;
}) {
  const Icon = CATEGORY_ICONS[category] ?? AlertTriangle;
  return <Icon className="h-4.5 w-4.5" />;
}

function getAccentStyles(notification: Notification) {
  const { priority, category } = notification;

  if (priority === "Critical" || priority === "Urgent") {
    return {
      border: "border-l-red-500",
      iconBg: "bg-red-50 text-red-600",
    };
  }

  if (
    category === "Dispatch Scheduled" ||
    category === "Settlement Released" ||
    category === "Offer Approved"
  ) {
    return {
      border: "border-l-[#1B6EF3]",
      iconBg: "bg-[#E8F1FF] text-[#1B6EF3]",
    };
  }

  return {
    border: "border-l-slate-300",
    iconBg: "bg-slate-100 text-slate-600",
  };
}

function getPriorityBadge(priority: Notification["priority"]) {
  if (priority === "Critical") {
    return { label: "CRITICAL", className: "bg-red-700 text-white" };
  }
  if (priority === "Urgent") {
    return { label: "URGENT", className: "bg-red-600 text-white" };
  }
  if (priority === "High") {
    return { label: "HIGH", className: "bg-amber-100 text-amber-700" };
  }
  return null;
}

interface NotificationCardProps {
  notification: Notification;
  index: number;
  onClick: (notification: Notification) => void;
}

export function NotificationCard({
  notification,
  index,
  onClick,
}: NotificationCardProps) {
  const accent = getAccentStyles(notification);
  const badge = getPriorityBadge(notification.priority);

  const timestamp = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)" }}
      onClick={() => onClick(notification)}
      className={cn(
        "relative flex w-full items-start gap-4 rounded-xl border border-slate-200 border-l-[4px] bg-white p-4 text-left shadow-sm transition-colors",
        accent.border,
        !notification.read && "bg-[#FAFCFF]",
      )}
    >
      {!notification.read ? (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#1B6EF3]" />
      ) : null}

      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          accent.iconBg,
        )}
      >
        <NotificationCategoryIcon category={notification.category} />
      </div>

      <div className="min-w-0 flex-1 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          {badge ? (
            <Badge
              className={cn(
                "rounded px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide",
                badge.className,
              )}
            >
              {badge.label}
            </Badge>
          ) : null}
          {notification.pinned ? (
            <Badge
              variant="outline"
              className="rounded px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-[#1B6EF3]"
            >
              Pinned
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-1 text-sm font-bold text-slate-900">
          {notification.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {notification.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {timestamp}
          </span>
          {notification.referenceLabel ? (
            <span>Ref: {notification.referenceLabel}</span>
          ) : (
            <span>Ref: {notification.referenceNumber}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
