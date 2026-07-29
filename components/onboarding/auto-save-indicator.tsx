"use client";

import { formatDistanceToNow } from "date-fns";
import { Cloud, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface AutoSaveIndicatorProps {
  className?: string;
}

export function AutoSaveIndicator({ className }: AutoSaveIndicatorProps) {
  const isSaving = useOnboardingStore((s) => s.isSaving);
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt);

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <Cloud className="h-3.5 w-3.5 text-success" />
          <span>
            Progress auto-saved{" "}
            {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
          </span>
        </>
      ) : (
        <>
          <Cloud className="h-3.5 w-3.5" />
          <span>Auto-save enabled</span>
        </>
      )}
    </div>
  );
}
