"use client";

import { CheckCheck, Trash2 } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { ExportDropdown } from "@/components/erp/export-dropdown";
import {
  NotificationCard,
  NotificationDrawer,
  NotificationFiltersBar,
  NotificationPagination,
  NotificationsEmptyState,
  NotificationsLoadingSkeleton,
  SummaryCards,
} from "@/components/notifications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationsView() {
  const loading = useNotificationStore((s) => s.loading);
  const filters = useNotificationStore((s) => s.filters);
  const search = useNotificationStore((s) => s.search);
  const drawerOpen = useNotificationStore((s) => s.drawerOpen);
  const selectedNotification = useNotificationStore(
    (s) => s.selectedNotification,
  );
  const visibleCount = useNotificationStore((s) => s.visibleCount);

  const bootstrap = useNotificationStore((s) => s.bootstrap);
  const setSearch = useNotificationStore((s) => s.setSearch);
  const setFilter = useNotificationStore((s) => s.setFilter);
  const clearFilters = useNotificationStore((s) => s.clearFilters);
  const openDrawer = useNotificationStore((s) => s.openDrawer);
  const closeDrawer = useNotificationStore((s) => s.closeDrawer);
  const markRead = useNotificationStore((s) => s.markRead);
  const markUnread = useNotificationStore((s) => s.markUnread);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const archiveNotification = useNotificationStore(
    (s) => s.archiveNotification,
  );
  const pinNotification = useNotificationStore((s) => s.pinNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const loadMore = useNotificationStore((s) => s.loadMore);
  const getFilteredNotifications = useNotificationStore(
    (s) => s.getFilteredNotifications,
  );
  const getVisibleNotifications = useNotificationStore(
    (s) => s.getVisibleNotifications,
  );
  const getSummary = useNotificationStore((s) => s.getSummary);
  const hasActiveFilters = useNotificationStore((s) => s.hasActiveFilters);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const summary = getSummary();
  const filtered = getFilteredNotifications();
  const visible = getVisibleNotifications();
  const activeFilters = hasActiveFilters();

  const handleMarkAllRead = () => {
    markAllRead();
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    clearAll();
    toast.success("All notifications cleared");
  };

  if (loading) {
    return <NotificationsLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            <span>Operational Control</span>
            <span className="mx-2 text-slate-300">&gt;</span>
            <span className="font-medium text-slate-700">Seller Alerts</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-200"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark All Read
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-slate-200 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all notifications from your inbox. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ExportDropdown
            label="Export"
            variant="outline"
            formats={["PDF", "Excel", "CSV"]}
          />
        </div>
      </div>

      <SummaryCards summary={summary} />

      <NotificationFiltersBar
        filters={filters}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onClearFilters={() => {
          clearFilters();
          toast.success("Filters cleared");
        }}
        hasActiveFilters={activeFilters}
      />

      {filtered.length === 0 ? (
        <NotificationsEmptyState
          hasActiveFilters={activeFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index}
              onClick={openDrawer}
            />
          ))}

          <NotificationPagination
            visibleCount={visibleCount}
            totalCount={filtered.length}
            onLoadMore={loadMore}
          />
        </div>
      )}

      <NotificationDrawer
        open={drawerOpen}
        notification={selectedNotification}
        onClose={closeDrawer}
        onMarkRead={markRead}
        onMarkUnread={markUnread}
        onDelete={deleteNotification}
        onArchive={archiveNotification}
        onPin={pinNotification}
      />
    </div>
  );
}
