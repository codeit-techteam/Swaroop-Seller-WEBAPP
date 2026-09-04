"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSellerNotificationStore } from "@/store/sellerNotificationStore";

const FILTERS = [
  "all",
  "unread",
  "orders",
  "offers",
  "payments",
  "documents",
  "requests",
] as const;

export function SellerNotificationsView() {
  const filter = useSellerNotificationStore((s) => s.filter);
  const setFilter = useSellerNotificationStore((s) => s.setFilter);
  const markRead = useSellerNotificationStore((s) => s.markRead);
  const markAllRead = useSellerNotificationStore((s) => s.markAllRead);
  const notifications = useSellerNotificationStore((s) => s.notifications);
  const items = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((item) => !item.read);
    return notifications.filter((item) => item.category === filter);
  }, [filter, notifications]);

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="outline" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Seller alerts for requests, orders, dispatch and settlements will appear here."
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article
              key={item.id}
              className={cn(
                "rounded-lg border bg-white p-4",
                !item.read && "border-[#1B6EF3]/40 bg-[#E8F1FF]/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.body}</p>
                </div>
                {!item.read ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markRead(item.id)}
                  >
                    Mark read
                  </Button>
                ) : null}
              </div>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-2 inline-block text-sm text-[#1B6EF3]"
                >
                  Open
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
