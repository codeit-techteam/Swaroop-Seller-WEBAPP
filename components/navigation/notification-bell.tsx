"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationBell() {
  const unreadCount = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.read && !n.archived).length,
  );

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href={ROUTES.NOTIFICATIONS}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-danger-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Notifications</span>
      </Link>
    </Button>
  );
}
