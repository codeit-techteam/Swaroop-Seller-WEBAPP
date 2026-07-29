"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SellerProfile } from "@/types/profile";

interface ProfileHeaderProps {
  seller: SellerProfile;
  onEditProfile: () => void;
  onViewPublicProfile: () => void;
  className?: string;
}

export function ProfileHeader({
  seller,
  onEditProfile,
  onViewPublicProfile,
  className,
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-[#E8F1FF] to-white md:h-24 md:w-24">
              {seller.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.logoUrl}
                  alt={`${seller.companyName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#1B6EF3]">
                  <Building2 className="h-8 w-8 md:h-10 md:w-10" />
                  <span className="mt-1 text-xs font-bold tracking-wide">
                    {seller.logoInitials}
                  </span>
                </div>
              )}
            </div>
            {seller.kycStatus === "verified" ? (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-bold text-white">
                ✓
              </span>
            ) : null}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#0B1F3A] md:text-2xl">
                {seller.companyName}
              </h2>
              {seller.kycStatus === "verified" ? (
                <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-200">
                  KYC Verified
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Partner since {seller.partnerSince}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Headquarters: {seller.headquarters}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>
                  Seller Rating:{" "}
                  <span className="font-semibold text-slate-700">
                    {seller.sellerRating.toFixed(1)}/
                    {seller.maxRating.toFixed(1)}
                  </span>
                </span>
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
          <Button
            variant="outline"
            className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={onViewPublicProfile}
          >
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
