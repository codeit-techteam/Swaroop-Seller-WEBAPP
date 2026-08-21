"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, Pencil, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/config/roles";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: AdminProfile;
  onEditProfile: () => void;
  className?: string;
}

export function ProfileHeader({
  profile,
  onEditProfile,
  className,
}: ProfileHeaderProps) {
  const statusLabel =
    profile.status === "active"
      ? "Active"
      : profile.status === "invited"
        ? "Invited"
        : "Suspended";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="h-1.5 bg-gradient-to-r from-[#0B1F3A] via-[#1B6EF3] to-[#0B1F3A]/80" />
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-[#E8F1FF] to-white md:h-24 md:w-24">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-wide text-[#1B6EF3] md:text-3xl">
                    {profile.initials}
                  </span>
                )}
              </div>
              {profile.status === "active" ? (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-bold text-white">
                  ✓
                </span>
              ) : null}
            </div>

            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#0B1F3A] md:text-2xl">
                  {profile.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-200">
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABELS[profile.role]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                    profile.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : profile.status === "invited"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-red-50 text-red-700 ring-red-200",
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {profile.joinedAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {profile.officeLocation}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {profile.department}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]"
              onClick={onEditProfile}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
