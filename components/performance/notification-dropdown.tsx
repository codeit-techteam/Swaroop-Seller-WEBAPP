"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PerformanceNotification } from "@/types/performance";

interface NotificationDropdownProps {
  notifications: PerformanceNotification[];
  unreadCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function notificationIcon(type: PerformanceNotification["type"]) {
  switch (type) {
    case "inventory":
      return Package;
    case "settlement":
      return CheckCircle2;
    case "offer":
      return CheckCircle2;
    case "dispatch":
      return Truck;
    default:
      return AlertTriangle;
  }
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  open,
  onOpenChange,
  onMarkRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-medium text-[#1B6EF3] hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcon(notification.type);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                    !notification.read && "bg-[#F8FBFF]",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      notification.read ? "bg-slate-100" : "bg-[#E8F1FF]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        notification.read ? "text-slate-400" : "text-[#1B6EF3]",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1B6EF3]" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-slate-100 p-2">
          <Button
            variant="ghost"
            className="w-full text-sm font-medium text-[#1B6EF3]"
            asChild
          >
            <Link href={ROUTES.NOTIFICATIONS}>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
