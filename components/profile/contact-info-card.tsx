"use client";

import { motion } from "framer-motion";
import { Copy, Mail, MapPin, Phone, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import type { AdminProfile } from "@/types/profile";

interface ContactInfoCardProps {
  profile: Pick<
    AdminProfile,
    "email" | "phone" | "officeLocation" | "employeeId"
  >;
  className?: string;
}

export function ContactInfoCard({ profile, className }: ContactInfoCardProps) {
  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Unable to copy");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-2 border-b border-slate-100 px-5 py-4">
        <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#1B6EF3]" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Contact Information
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            How colleagues and the system reach you
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <InfoRow
          icon={Mail}
          label="Work Email"
          value={profile.email}
          onCopy={() => void handleCopy("Email", profile.email)}
        />
        <InfoRow
          icon={Phone}
          label="Phone"
          value={profile.phone}
          onCopy={() => void handleCopy("Phone", profile.phone)}
        />
        <InfoRow
          icon={MapPin}
          label="Office"
          value={profile.officeLocation}
        />
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Employee ID
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-semibold tracking-wide text-slate-800">
              {profile.employeeId}
            </p>
            <button
              type="button"
              onClick={() => void handleCopy("Employee ID", profile.employeeId)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-[#1B6EF3]"
              aria-label="Copy employee ID"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  onCopy,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#1B6EF3]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-800">{value}</p>
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#1B6EF3]"
              aria-label={`Copy ${label}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
