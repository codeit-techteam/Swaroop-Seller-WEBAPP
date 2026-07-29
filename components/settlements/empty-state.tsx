"use client";

import { Banknote, FileText, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateVariant =
  "no-settlements" | "no-payment-history" | "no-receipts";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  hasFilters?: boolean;
  className?: string;
}

const config: Record<
  EmptyStateVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
> = {
  "no-settlements": {
    icon: Banknote,
    title: "No Settlements Found",
    description: "There are no settlement records matching your criteria.",
  },
  "no-payment-history": {
    icon: Receipt,
    title: "No Payment History",
    description: "Payment details will appear once funds are disbursed.",
  },
  "no-receipts": {
    icon: FileText,
    title: "No Receipts",
    description: "Receipts are available after settlement completion.",
  },
};

export function EmptyState({
  variant = "no-settlements",
  hasFilters,
  className,
}: EmptyStateProps) {
  const { icon: Icon, title, description } = config[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "Try adjusting your search or filters to find settlements."
          : description}
      </p>
    </div>
  );
}
