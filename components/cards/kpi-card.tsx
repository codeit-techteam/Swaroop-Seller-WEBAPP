import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("border-slate-200 shadow-none", className)}>
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#1B6EF3]">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
