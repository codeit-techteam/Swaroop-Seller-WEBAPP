import { Badge } from "@/components/ui/badge";
import { cn, getStatusColor } from "@/lib/utils";
import type { StatusVariant } from "@/types/common";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({
  label,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", getStatusColor(variant), className)}
    >
      {label}
    </Badge>
  );
}

interface TrendBadgeProps {
  value: number;
  label?: string;
  className?: string;
}

export function TrendBadge({ value, label, className }: TrendBadgeProps) {
  const isPositive = value >= 0;
  const variant: StatusVariant = isPositive ? "success" : "danger";

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", getStatusColor(variant), className)}
    >
      {isPositive ? "+" : ""}
      {value}%{label ? ` ${label}` : null}
    </Badge>
  );
}
