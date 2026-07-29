"use client";

import { FileSearch, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  hasFilters?: boolean;
  variant?: "no-requests" | "no-pending" | "no-results";
  className?: string;
}

const config = {
  "no-requests": {
    icon: Inbox,
    title: "No Requests",
    description: "There are no price revision requests at this time.",
  },
  "no-pending": {
    icon: Inbox,
    title: "No Pending Requests",
    description: "All price revision requests have been addressed.",
  },
  "no-results": {
    icon: FileSearch,
    title: "No Search Results",
    description: "No requests match your current search or filters.",
  },
};

export function EmptyState({
  hasFilters,
  variant = "no-requests",
  className,
}: EmptyStateProps) {
  const resolved = hasFilters ? config["no-results"] : config[variant];
  const Icon = resolved.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-700">
        {resolved.title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {resolved.description}
      </p>
    </div>
  );
}
