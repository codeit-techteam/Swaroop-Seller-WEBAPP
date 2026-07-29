"use client";

import Link from "next/link";

import { Timeline } from "@/components/erp/timeline";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/dashboard";

interface ActivityCardProps {
  logs: ActivityLog[];
  viewAllHref?: string;
  className?: string;
}

export function ActivityCard({
  logs,
  viewAllHref = "/notifications",
  className,
}: ActivityCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">Activity Logs</h3>
      <div className="mt-4 flex-1">
        <Timeline
          items={logs.map((log) => ({
            id: log.id,
            title: log.title,
            description: log.description,
            time: log.time,
            status: log.status,
          }))}
        />
      </div>
      <Link
        href={viewAllHref}
        className="mt-4 text-sm font-medium text-[#1B6EF3] hover:underline"
      >
        View All Audit Logs
      </Link>
    </div>
  );
}
