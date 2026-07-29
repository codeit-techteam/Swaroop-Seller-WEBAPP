"use client";

import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface DraftIndicatorProps {
  lastSavedAt: string | null;
  className?: string;
}

export function DraftIndicator({
  lastSavedAt,
  className,
}: DraftIndicatorProps) {
  if (!lastSavedAt) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-emerald-600",
        className,
      )}
    >
      <CheckCircle2 className="h-4 w-4" />
      <span>Auto-saved as draft {format(new Date(lastSavedAt), "h:mm a")}</span>
    </div>
  );
}
