import { Pencil } from "lucide-react";

import { VerificationStatusBadge } from "@/components/onboarding/verification-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ReviewCard({
  title,
  onEdit,
  children,
  className,
}: ReviewCardProps) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {onEdit ? (
          <Button variant="ghost" size="sm" onClick={onEdit} type="button">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface InformationCardProps {
  label: string;
  value: string;
  verified?: boolean;
  className?: string;
}

export function InformationCard({
  label,
  value,
  verified,
  className,
}: InformationCardProps) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {verified ? <VerificationStatusBadge status="verified" /> : null}
      </div>
      <p className="font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

interface ReviewFieldProps {
  label: string;
  value: string;
  className?: string;
}

export function ReviewField({ label, value, className }: ReviewFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold">{value || "—"}</p>
    </div>
  );
}
