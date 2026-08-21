"use client";

import { motion } from "framer-motion";
import { LayoutGrid, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LogisticsPartner, SellerProfile } from "@/types/profile";

interface OperationsCardProps {
  seller: Pick<
    SellerProfile,
    | "primaryCategories"
    | "warehouses"
    | "logisticsPartners"
    | "businessType"
    | "yearsInBusiness"
  >;
  className?: string;
}

export function OperationsCard({ seller, className }: OperationsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-2 border-b border-slate-100 px-5 py-4">
        <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[#1B6EF3]" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Operations Profile
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Categories, warehouses &amp; logistics
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Primary Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {seller.primaryCategories.map((category) => (
              <span
                key={category}
                className="rounded-md bg-[#E8F1FF] px-2.5 py-1 text-xs font-medium text-[#1B6EF3]"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Warehouse Locations
          </p>
          <ul className="space-y-2">
            {seller.warehouses.map((warehouse) => (
              <li
                key={warehouse.id}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  {warehouse.label}
                  {warehouse.isPrimary ? (
                    <span className="ml-1 text-slate-400">(Primary)</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Logistics Partners
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {seller.logisticsPartners.map((partner) => (
              <PartnerBadge key={partner.id} partner={partner} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Business Type
            </p>
            <p className="text-sm font-medium text-slate-800">
              {seller.businessType}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Years in Business
            </p>
            <p className="text-sm font-medium text-slate-800">
              {seller.yearsInBusiness} years
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PartnerBadge({ partner }: { partner: LogisticsPartner }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
        style={{ backgroundColor: partner.color }}
      >
        {partner.initials}
      </span>
      <span className="text-xs font-medium text-slate-700">{partner.name}</span>
    </div>
  );
}
