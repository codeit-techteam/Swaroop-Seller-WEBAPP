"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { KeyRound, Shield } from "lucide-react";

import { ROLE_LABELS } from "@/config/roles";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "@/types/profile";

interface RoleAccessCardProps {
  profile: Pick<
    AdminProfile,
    "role" | "department" | "permissions" | "lastLoginAt" | "status"
  >;
  className?: string;
}

export function RoleAccessCard({ profile, className }: RoleAccessCardProps) {
  const permissionPreview = profile.permissions.slice(0, 12);
  const remaining = profile.permissions.length - permissionPreview.length;

  let lastLoginLabel = profile.lastLoginAt;
  try {
    lastLoginLabel = format(
      parseISO(profile.lastLoginAt),
      "dd MMM yyyy 'at' HH:mm",
    );
  } catch {
    // keep raw string
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#1B6EF3]" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Role &amp; Access
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Panel permissions for this admin account
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
          <KeyRound className="h-3.5 w-3.5" />
          {ROLE_LABELS[profile.role]}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Role
            </p>
            <p className="text-sm font-medium text-slate-800">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Department
            </p>
            <p className="text-sm font-medium text-slate-800">
              {profile.department}
            </p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Last Login
            </p>
            <p className="text-sm font-medium text-slate-800">{lastLoginLabel}</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Permissions ({profile.permissions.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {permissionPreview.map((permission) => (
              <span
                key={permission}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
              >
                {permission}
              </span>
            ))}
            {remaining > 0 ? (
              <span className="rounded-md border border-dashed border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400">
                +{remaining} more
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
