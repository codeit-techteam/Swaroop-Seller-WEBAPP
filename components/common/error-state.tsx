import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function ErrorState({
  title = "Unable to load this page",
  description = "Please try again. If the problem continues, refresh the browser.",
  onRetry,
  icon: Icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-white px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Icon className="h-6 w-6 text-red-600" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
