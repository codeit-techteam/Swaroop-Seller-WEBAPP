import { cn, getStatusColor } from "@/lib/utils";
import type { StatusVariant } from "@/types/common";

interface VerificationStatusBadgeProps {
  status: "verified" | "pending" | "rejected" | "idle" | "loading";
  label?: string;
  className?: string;
}

const statusMap: Record<
  VerificationStatusBadgeProps["status"],
  { variant: StatusVariant; defaultLabel: string }
> = {
  verified: { variant: "success", defaultLabel: "Verified" },
  pending: { variant: "warning", defaultLabel: "Pending Review" },
  rejected: { variant: "danger", defaultLabel: "Rejected" },
  idle: { variant: "muted", defaultLabel: "Not Verified" },
  loading: { variant: "info", defaultLabel: "Verifying..." },
};

export function VerificationStatusBadge({
  status,
  label,
  className,
}: VerificationStatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        getStatusColor(config.variant),
        className,
      )}
    >
      {status === "verified" && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {label ?? config.defaultLabel}
    </span>
  );
}

interface VerificationStatusCardProps {
  status: "verified" | "pending" | "rejected";
  title: string;
  description: string;
  className?: string;
}

const cardStyles = {
  verified: "border-success/30 bg-success/5",
  pending: "border-warning/30 bg-warning/5",
  rejected: "border-destructive/30 bg-destructive/5",
};

const dotStyles = {
  verified: "bg-success",
  pending: "bg-warning",
  rejected: "bg-destructive",
};

export function VerificationStatusCard({
  status,
  title,
  description,
  className,
}: VerificationStatusCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", cardStyles[status], className)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dotStyles[status])} />
        <span className="text-xs font-bold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
