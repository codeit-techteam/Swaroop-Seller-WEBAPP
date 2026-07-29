import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("shadow-soft", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend ? <div className="mt-2">{trend}</div> : null}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-soft", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {sublabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}
