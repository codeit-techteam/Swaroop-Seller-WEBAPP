"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { PriceRevisionStatus } from "@/types/price-revision";

interface DeadlineTimerProps {
  deadline: string;
  status: PriceRevisionStatus;
  className?: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";

  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function DeadlineTimer({
  deadline,
  status,
  className,
}: DeadlineTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    formatRemaining(new Date(deadline).getTime() - Date.now()),
  );

  useEffect(() => {
    const tick = () => {
      setRemaining(formatRemaining(new Date(deadline).getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  const isExpired =
    status === "expired" ||
    remaining === "Expired" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "completed";

  const deadlineMs = new Date(deadline).getTime();
  const isUrgent =
    !isExpired && deadlineMs - new Date().getTime() < 24 * 60 * 60 * 1000;

  if (status === "completed" || status === "accepted") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase text-emerald-600",
          className,
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  if (isExpired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase text-red-600",
          className,
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        Expired
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
        isUrgent ? "text-orange-600" : "text-slate-500",
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {remaining}
    </span>
  );
}
