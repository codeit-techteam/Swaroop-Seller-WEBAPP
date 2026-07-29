"use client";

import { AlertTriangle, FileWarning, Info, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ComplianceAdminRemark } from "@/types/compliance";

interface AdminRemarksCardProps {
  remark: ComplianceAdminRemark | null;
  className?: string;
}

function remarkStyles(type: ComplianceAdminRemark["type"]) {
  switch (type) {
    case "rejected_reason":
      return {
        wrap: "border-rose-200 bg-rose-50",
        icon: ShieldAlert,
        iconClass: "text-rose-600",
        title: "text-rose-900",
      };
    case "missing_document":
      return {
        wrap: "border-amber-200 bg-amber-50",
        icon: FileWarning,
        iconClass: "text-amber-600",
        title: "text-amber-900",
      };
    case "renewal_required":
      return {
        wrap: "border-orange-200 bg-orange-50",
        icon: AlertTriangle,
        iconClass: "text-orange-600",
        title: "text-orange-900",
      };
    case "compliance_notice":
      return {
        wrap: "border-sky-200 bg-sky-50",
        icon: Info,
        iconClass: "text-sky-600",
        title: "text-sky-900",
      };
    default:
      return {
        wrap: "border-slate-200 bg-slate-50",
        icon: Info,
        iconClass: "text-slate-500",
        title: "text-slate-800",
      };
  }
}

export function AdminRemarksCard({ remark, className }: AdminRemarksCardProps) {
  if (!remark || remark.type === "none") return null;

  const styles = remarkStyles(remark.type);
  const Icon = styles.icon;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Admin Remarks
      </h4>
      <div className={cn("rounded-xl border-l-4 px-4 py-3", styles.wrap)}>
        <div className="flex items-start gap-2">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.iconClass)} />
          <div>
            <p className={cn("text-sm font-semibold", styles.title)}>
              {remark.title}
            </p>
            <p className="mt-1 text-sm italic leading-relaxed text-slate-700">
              &ldquo;{remark.message}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
