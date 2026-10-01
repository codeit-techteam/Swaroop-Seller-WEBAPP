import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
  /** Makes the whole card a link (ignored when `footer` is set, to avoid nested interactives). */
  href?: string;
  footer?: ReactNode;
  tone?: "default" | "error";
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  href,
  footer,
  tone = "default",
}: KpiCardProps) {
  const card = (
    <Card
      className={cn(
        "h-full border-slate-200 shadow-none",
        href && !footer && "transition-colors hover:border-[#1B6EF3]",
        tone === "error" && "border-red-200 bg-red-50/40",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? (
            <p
              className={cn(
                "mt-1 text-xs",
                tone === "error" ? "text-red-600" : "text-slate-500",
              )}
            >
              {hint}
            </p>
          ) : null}
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tone === "error"
              ? "bg-red-100 text-red-600"
              : "bg-[#E8F1FF] text-[#1B6EF3]",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );

  if (href && !footer) {
    return (
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EF3]"
      >
        {card}
      </Link>
    );
  }
  return card;
}
