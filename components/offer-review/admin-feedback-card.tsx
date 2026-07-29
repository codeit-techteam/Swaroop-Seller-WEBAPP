"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AdminFeedback } from "@/types/offer-review";

interface AdminFeedbackCardProps {
  feedback: AdminFeedback | null;
  className?: string;
}

function feedbackStyles(type: AdminFeedback["type"]) {
  switch (type) {
    case "warning":
      return {
        wrap: "border-orange-200 bg-orange-50",
        icon: AlertTriangle,
        iconClass: "text-orange-600",
        title: "text-orange-900",
      };
    case "danger":
      return {
        wrap: "border-red-200 bg-red-50",
        icon: ShieldAlert,
        iconClass: "text-red-600",
        title: "text-red-900",
      };
    default:
      return {
        wrap: "border-sky-200 bg-sky-50",
        icon: Info,
        iconClass: "text-sky-600",
        title: "text-sky-900",
      };
  }
}

export function AdminFeedbackCard({
  feedback,
  className,
}: AdminFeedbackCardProps) {
  if (!feedback) return null;

  const styles = feedbackStyles(feedback.type);
  const Icon = styles.icon;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Admin Feedback
      </h4>
      <div className={cn("rounded-xl border px-4 py-3", styles.wrap)}>
        <div className="flex items-start gap-2">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.iconClass)} />
          <div>
            <p className={cn("text-sm font-semibold", styles.title)}>
              {feedback.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {feedback.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
