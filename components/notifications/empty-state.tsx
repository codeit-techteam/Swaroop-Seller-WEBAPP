"use client";

import { BellOff } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

interface NotificationsEmptyStateProps {
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function NotificationsEmptyState({
  onClearFilters,
  hasActiveFilters,
}: NotificationsEmptyStateProps) {
  return (
    <EmptyState
      icon={BellOff}
      title="No Notifications"
      description={
        hasActiveFilters
          ? "No notifications match your current filters. Try adjusting or clearing filters."
          : "You're all caught up. New seller alerts will appear here."
      }
      action={
        hasActiveFilters && onClearFilters ? (
          <Button
            onClick={onClearFilters}
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
          >
            Clear Filters
          </Button>
        ) : undefined
      }
      className="border-slate-200 bg-white py-20"
    />
  );
}
