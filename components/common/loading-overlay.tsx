"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  visible?: boolean;
  label?: string;
  className?: string;
}

export function LoadingOverlay({
  visible = true,
  label = "Loading...",
  className,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
