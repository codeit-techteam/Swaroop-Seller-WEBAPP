"use client";

import { Clock3, FileText, SearchX } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateVariant = "no-documents" | "no-results" | "no-pending";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
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
  "no-documents": {
    icon: FileText,
    title: "No Documents",
    description:
      "You have not uploaded any compliance documents yet. Upload certifications to enable trading.",
  },
  "no-results": {
    icon: SearchX,
    title: "No Search Results",
    description:
      "No certifications match your current search or filters. Try adjusting your criteria.",
  },
  "no-pending": {
    icon: Clock3,
    title: "No Pending Verification",
    description:
      "All submitted documents have been reviewed. Upload new certifications as needed.",
  },
};

export function EmptyState({
  variant = "no-documents",
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
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
