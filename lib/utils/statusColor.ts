import type { StatusVariant } from "@/types/common";

const statusColorMap: Record<StatusVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
};

export function getStatusColor(variant: StatusVariant): string {
  return statusColorMap[variant];
}

export function getStatusDotColor(variant: StatusVariant): string {
  const dotMap: Record<StatusVariant, string> = {
    default: "bg-secondary-foreground",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-primary",
    muted: "bg-muted-foreground",
  };
  return dotMap[variant];
}
